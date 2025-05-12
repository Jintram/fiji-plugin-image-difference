


// This is a script intended as FIJI macro 

/* 

Script to calculate the distance between 
sets of images.

MW 2025/05

*/

// Test folders, e.g.:
var default1 = "/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_A/"
var default2 = "/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_B/"
// /Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_A
// /Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_B

// Import necessary classes
importClass(Packages.ij.IJ);
importClass(Packages.ij.measure.ResultsTable);

/* ------------------------------------------------------------------------ */

/* A dialogue box with two path fields and two corresponding buttons that 
the user can use to respectively select two folders. */

//Import classes
importClass(Packages.ij.gui.GenericDialog);
importClass(Packages.ij.io.DirectoryChooser);
importClass(Packages.ij.plugin.frame.RoiManager);

// Create a dialog box
var gd = new GenericDialog("Select Folders");

// Add two path fields with respective browse buttons buttons
gd.addStringField("Folder 1:", default1, 40);
// Add buttons to select folders
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

// Show the dialog
gd.showDialog();

// Now set the paths to the chosen locations
var folder1Path = gd.getNextString();
var folder2Path = gd.getNextString();

// Print a message saying which two folders were selected
print("Folder 1: " + folder1Path);
print("Folder 2: " + folder2Path);

/* ------------------------------------------------------------------------ */

// Get the list of image files in the folder
var folder = new java.io.File(folder1Path);
var files = folder.listFiles();

// Create a ResultsTable to store the results
var results = new ResultsTable();

// Create an ROI manager
var roiManager = RoiManager.getInstance()

// Loop through each file in the folder
for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file.isFile() && file.getName().endsWith(".tif")) {
        
        // Get the part of the filename before the double underscore "__"
        var fileName1 = file.getName();
        var underscoreIndex = fileName1.indexOf("__");
        if (underscoreIndex != -1) {
            var file_identifier = fileName1.substring(0, underscoreIndex);
        }        
        print("File identifier: " + file_identifier);
        
        // Also open the ROI file
        // Construct the ROI file path
        var roiFilePath = file.getAbsolutePath().replace(".tif", "_roi.zip");

        // Check if the ROI file exists
        // Load the corresponding ROI file
        var roiFile = new File(roiFilePath);
        if (roiFile.exists()) {
            roiManager.reset(); // Clear previous ROIs
            roiManager.runCommand("Open", roiFilePath); // Load ROIs            
        } else {
            print("ROI file not found!!! -- " + roiFilePath);
        }
        
        // Now identify the file in the 2nd folder that also starts with
        // that identifier and two underscores
        var folder2 = new java.io.File(folder2Path);
        var files2 = folder2.listFiles();
        var file2 = null;
        for (var j = 0; j < files2.length; j++) {
            var file2_candidate = files2[j];
            if (file2_candidate.isFile() && file2_candidate.getName().startsWith(file_identifier + "__")) {
                file2 = file2_candidate;
                break;
            }
        }
        fileName2 = file2.getName();
        print("File 1: "+fileName1);
        print("File 2: "+fileName2);
        print("ROI file: " + roiFilePath);
                
        // Open the two image
        var image1 = IJ.openImage(file.getAbsolutePath());
        var image2 = IJ.openImage(file2.getAbsolutePath());
        
        if (image1 != null) {
            
            
            // Ensure both images have the same dimensions
            if (image1.getWidth() === image2.getWidth() && image1.getHeight() === image2.getHeight()) {
                var width = image1.getWidth();
                var height = image1.getHeight();

                // Access the pixel arrays of both images
                var processor1 = image1.getProcessor();
                var processor2 = image2.getProcessor();

                // Now calculate the mean value of both images
                var stats1 = image1.getStatistics();
                var meanIntensity1 = stats1.mean;
                var stats2 = image2.getStatistics();
                var meanIntensity2 = stats2.mean;                                    
                // Also get the std
                var std1 = stats1.stdDev;
                var std2 = stats2.stdDev;
                
                var diffSum = 0;
                var crossCorrPt1 =0;

                // Loop through each pixel
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var pixel1 = processor1.getPixel(x, y);
                        var pixel2 = processor2.getPixel(x, y);

                        // Calculate the absolute difference
                        var diff = Math.abs(pixel1 - pixel2);
                        diffSum += diff;
                        // Calculate the pearson correlation part
                        crossCorrPt1 += (pixel1 - meanIntensity1) * (pixel2 - meanIntensity2);
                    }
                }

                // Calculate the mean difference
                var meanDifference = diffSum / (width * height);
                // Calculate the Pearson correlation
                var pearsonCorrelation = crossCorrPt1 / (std1 * std2 * width * height);
                    // (width * height) factor to compensate 1/N term in default stdDev calculation

                /* Now normalize the image such that the bottom 5% percentile
                of intensity is the new lowest value and the top 5% percentile
                is the new maximum value in the picture */
                // Get the pixel values as an array
                var pixels  = processor1.getPixels();
                var pixels2 = processor2.getPixels();

                // Sort the pixel values to find percentiles
                var sortedPixels = java.util.Arrays.copyOf(pixels, pixels.length);
                var sortedPixels2 = java.util.Arrays.copyOf(pixels2, pixels2.length);
                java.util.Arrays.sort(sortedPixels);
                java.util.Arrays.sort(sortedPixels2);

                // Calculate the 5th and 95th percentiles
                var lowerPercentileIndex = Math.floor(0.05 * sortedPixels.length);
                var upperPercentileIndex = Math.floor(0.95 * sortedPixels.length);
                var lowerPercentileValue = sortedPixels[lowerPercentileIndex];
                var upperPercentileValue = sortedPixels[upperPercentileIndex];
                // For the 2nd image
                var lowerPercentileIndex2 = Math.floor(0.05 * sortedPixels2.length);
                var upperPercentileIndex2 = Math.floor(0.95 * sortedPixels2.length);
                var lowerPercentileValue2 = sortedPixels2[lowerPercentileIndex2];
                var upperPercentileValue2 = sortedPixels2[upperPercentileIndex2];

                // Normalize the pixel values
                // I think this could also be done with built-in functions, 
                // but for now I'm keeping it this way, as it might be convenient
                // when working with ROIs (although those also perhaps could be
                // saved separately
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var pixelValue  = processor1.getPixel(x, y);
                        var pixelValue2 = processor2.getPixel(x, y);

                        // Apply normalization
                        var normalizedValue = (pixelValue - lowerPercentileValue) / (upperPercentileValue - lowerPercentileValue);
                        normalizedValue = Math.max(0, Math.min(1, normalizedValue)); // Clamp between 0 and 1
                        processor1.putPixelValue(x, y, normalizedValue * 255); // Scale back to 0-255 range
                        // Apply normalization to 2nd image
                        var normalizedValue2 = (pixelValue2 - lowerPercentileValue2) / (upperPercentileValue2 - lowerPercentileValue2);
                        normalizedValue2 = Math.max(0, Math.min(1, normalizedValue2)); // Clamp between 0 and 1
                        processor2.putPixelValue(x, y, normalizedValue2 * 255); // Scale back to 0-255 range
                        
                    }
                }
                // Convert image1 and image2 type to 8bit
                IJ.run(image1, "8-bit", "");
                IJ.run(image2, "8-bit", "");
                                    
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
                
                // Close the images
                // image1.close();
                // image2.close();
                
                // Add the result to the table
                results.incrementCounter();
                results.addValue("Image Name", file.getName());
                results.addValue("Mean Difference", meanDifference);
                results.addValue("Pearson Corr", pearsonCorrelation);
            } else {
                print("Image dimensions do not match for " + fileName1 + " and " + fileName2);
            }
            
            /*
            // Calculate the mean intensity
            image.show();
            IJ.run("Measure");
            var stats = image.getStatistics();
            var meanIntensity = stats.mean;

            // Add the result to the table
            results.incrementCounter();
            results.addValue("Image Name", file.getName());
            results.addValue("Mean Intensity", meanIntensity);
            */
           
            // Close the images
            image1.close();
            image2.close();
        }
        
       
    }
}


// Show the results table
results.show("Mean Intensity Results");


