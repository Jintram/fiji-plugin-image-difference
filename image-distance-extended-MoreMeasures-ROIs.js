// This is a script intended as FIJI macro 

// Import necessary classes
importClass(Packages.ij.IJ);
importClass(Packages.ij.measure.ResultsTable);
importClass(Packages.ij.gui.GenericDialog);
importClass(Packages.ij.io.DirectoryChooser);
importClass(Packages.ij.plugin.frame.RoiManager);
importClass(Packages.java.io.File);
// import "matchingFiles"

// Test folders, e.g.:
var default1 = "/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_A/"
var default2 = "/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_B/"

// Create a dialog box
var gd = new GenericDialog("Select Folders");
gd.addStringField("Folder 1:", default1, 40);
gd.addButton("Browse Folder 1", function() {
    var dirChooser1 = new DirectoryChooser("Select Folder 1");
    var selectedFolder1 = dirChooser1.getDirectory();
    if (selectedFolder1 != null) {
        gd.getStringFields().get(0).setText(selectedFolder1);
    }
});
gd.addStringField("Folder 2:", default2, 40);
gd.addButton("Browse Folder 2", function() {
    var dirChooser2 = new DirectoryChooser("Select Folder 2");
    var selectedFolder2 = dirChooser2.getDirectory();
    if (selectedFolder2 != null) {
        gd.getStringFields().get(1).setText(selectedFolder2);
    }
});
gd.showDialog();
var folder1Path = gd.getNextString();
var folder2Path = gd.getNextString();

print("Folder 1: " + folder1Path);
print("Folder 2: " + folder2Path);

var folder = new java.io.File(folder1Path);
var files = folder.listFiles();
var results = new ResultsTable();
var roiManager = RoiManager.getInstance();
if (roiManager == null) {
    roiManager = new RoiManager();
}

for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file.isFile() && file.getName().endsWith(".tif")) {
        var fileName1 = file.getName();
        var underscoreIndex = fileName1.indexOf("__");
        if (underscoreIndex != -1) {
            var file_identifier = fileName1.substring(0, underscoreIndex);
        }        
        var roiFilePath = file.getAbsolutePath().replace(".tif", "_roi.zip");
        var roiFile = new File(roiFilePath);
        if (!roiFile.exists()) {
            print("ROI file not found!!! -- " + roiFilePath);
            continue;
        }
        roiManager.reset();
        roiManager.runCommand("Open", roiFilePath);

        // Find corresponding file in folder2
        var folder2 = new java.io.File(folder2Path);
        // get list of files that match filter
        var FilenameFilter = Java.type("java.io.FilenameFilter");
        var filter = new FilenameFilter({
            accept: function(dir, name) {
                return name.startsWith(file_identifier + "__");
            }
        });
        var matchingFiles = folder2.listFiles(filter); // note: a FilenameFilter can be given as input to "listFiles"
        // return first fill or null if not found
        var file2 = (matchingFiles && matchingFiles.length > 0) ? matchingFiles[0] : null;

        var image1 = IJ.openImage(file.getAbsolutePath());
        var image2 = IJ.openImage(file2.getAbsolutePath());
        
        // Check if images exist and have matching dimensions
        if (!image1 || !image2) {
            print("Issue loading images -- " + file.getAbsolutePath() + " or " + file2.getAbsolutePath());
            continue;
        }
        if (image1.getWidth() !== image2.getWidth() || image1.getHeight() !== image2.getHeight()) {
            print("Image dimensions do not match for " + fileName1 + " and " + fileName2);
            image1.close(); image2.close();
            continue;
        }
        var width = image1.getWidth();
        var height = image1.getHeight();
                
        // For each ROI
        var nRois = roiManager.getCount();
        for (var r = 0; r < nRois; r++) {
            var roi = roiManager.getRoi(r);
            var roiName = roi.getName() || ("ROI_" + (r+1));
            image1.setRoi(roi);
            image2.setRoi(roi);

            var stats1 = image1.getStatistics();
            var stats2 = image2.getStatistics();
            var meanIntensity1 = stats1.mean;
            var meanIntensity2 = stats2.mean;
            var std1 = stats1.stdDev;
            var std2 = stats2.stdDev;

            // Get mask for ROI
            var mask = roi.getMask();
            var bounds = roi.getBounds();
            var processor1 = image1.getProcessor();
            var processor2 = image2.getProcessor();

            // initialize parameters
            var diffSum = 0;
            var corrTerm1 = 0;
            var pixelCount = 0;
            var RMSEterm1 = 0;
            var pixels1 = [];
            var pixels2 = [];

            // loop over pixels within bounds of ROI (w/ check later for actual shape)
            for (var y = bounds.y; y < bounds.y + bounds.height; y++) {
                for (var x = bounds.x; x < bounds.x + bounds.width; x++) {
                    // Check if pixel is in ROI
                    var inRoi = mask ? (mask.getPixel(x - bounds.x, y - bounds.y) > 0) : roi.contains(x, y);
                    // If so, take pixel along for calculations
                    if (inRoi) {
                        // Acquire pixels
                        var pixel1 = processor1.getPixel(x, y);
                        var pixel2 = processor2.getPixel(x, y);
                        // Calculate difference
                        diffSum += Math.abs(pixel1 - pixel2);
                        // Calculate RMSE term
                        RMSEterm1 += Math.pow(pixel1 - pixel2, 2);
                        // Calculate term for correlation
                        corrTerm1 += (pixel1 - meanIntensity1) * (pixel2 - meanIntensity2);
                        // Store pixel values for normalization
                        pixels1.push(pixel1);
                        pixels2.push(pixel2);
                        pixelCount++;
                    }
                }
            }
            if (pixelCount === 0) continue;

            // Calculate mean difference, RMSE and Pearson correlation
            var meanDifference = diffSum / pixelCount;
            var pearsonCorrelation = corrTerm1 / (std1 * std2 * pixelCount); // pixelCount added because std1 = std1'/sqrt(pixelCount)
            var RMSE = Math.sqrt(RMSEterm1 / pixelCount);

            /*
            // Percentile normalization
            // Create sorted pixels 
            var DoubleArray = Java.type("double[]");
            var sorted1 = java.util.Arrays.copyOf(Java.to(pixels1, DoubleArray), pixels1.length);
            var sorted2 = java.util.Arrays.copyOf(Java.to(pixels2, DoubleArray), pixels2.length);
            java.util.Arrays.sort(sorted1);
            java.util.Arrays.sort(sorted2);
            
            // Function to get percentile value
            function getPercentile(sortedArr, p) {
                var idx = Math.floor(p * sortedArr.length);
                return sortedArr[Math.max(0, Math.min(sortedArr.length - 1, idx))];
            }
            
            // Determine percentile values
            var p05_1 = getPercentile(sorted1, 0.01);
            var p95_1 = getPercentile(sorted1, 0.99);
            var p05_2 = getPercentile(sorted2, 0.01);
            var p95_2 = getPercentile(sorted2, 0.99);

            // Normalize pixels in ROI
            for (var y = bounds.y; y < bounds.y + bounds.height; y++) {
                for (var x = bounds.x; x < bounds.x + bounds.width; x++) {
                    var inRoi = mask ? (mask.getPixel(x - bounds.x, y - bounds.y) > 0) : roi.contains(x, y);
                    if (inRoi) {
                        var pixelValue1 = processor1.getPixel(x, y);
                        var pixelValue2 = processor2.getPixel(x, y);
                        var norm1 = (pixelValue1 - p05_1) / (p95_1 - p05_1);
                        var norm2 = (pixelValue2 - p05_2) / (p95_2 - p05_2);
                        norm1 = Math.max(0, Math.min(1, norm1));
                        norm2 = Math.max(0, Math.min(1, norm2));
                        processor1.putPixelValue(x, y, norm1 * 65536);
                        processor2.putPixelValue(x, y, norm2 * 65536);
                    }
                }
            }
            */
            
            // Add result to table
            results.incrementCounter();
            results.addValue("Image Name", file.getName());
            results.addValue("ROI Name", roiName);
            results.addValue("Mean Difference", meanDifference);
            results.addValue("Pearson Corr", pearsonCorrelation);
            results.addValue("RMSE", RMSE);
        }
        // Now save the processed images
                            
        /*
        // Then make pixels outside the ROIs equal to zero
        // Combine all ROIs into a single ROI using RoiManager's "Combine" command
        roiManager.runCommand("Combine");
        var maskAll = roiManager.getRoi(roiManager.getCount() - 1);
        image1.setRoi(maskAll);
        image2.setRoi(maskAll);
        image1.getProcessor().setValue(0);
        image2.getProcessor().setValue(0);
        image1.getProcessor().fillOutside(maskAll);
        image2.getProcessor().fillOutside(maskAll);
        image1.deleteRoi();
        image2.deleteRoi();
        
        // Now save these normalized images to respective subfolders "processed"
        // for inspection
        var processedFolder1 = new java.io.File(folder1Path + "processed/");
        var processedFolder2 = new java.io.File(folder2Path + "processed/");
        if (!processedFolder1.exists()) {
            processedFolder1.mkdirs();
        }
        if (!processedFolder2.exists()) {
            processedFolder2.mkdirs();
        }
        // save the two normalized images to those folder
        var normalizedImage1 = new java.io.File(processedFolder1, file.getName());
        var normalizedImage2 = new java.io.File(processedFolder2, file2.getName());
        IJ.save(image1, normalizedImage1.getAbsolutePath());
        IJ.save(image2, normalizedImage2.getAbsolutePath());
        */
       
        // Close the image
        image1.close();
        image2.close();
    }
}
results.show("ROI Results");
