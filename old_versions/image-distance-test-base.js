


// This is a script intended as FIJI macro 

/* 

Script to calculate the distance between 
sets of images.

MW 2025/05

*/

// Test folders, e.g.:
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

// Create a dialog box
var gd = new GenericDialog("Select Folders");

// Add two path fields with respective browse buttons buttons
gd.addStringField("Folder 1:", "", 40);
// Add buttons to select folders
gd.addButton("Browse Folder 1", function() {
    var dirChooser1 = new DirectoryChooser("Select Folder 1");
    var selectedFolder1 = dirChooser1.getDirectory();
    if (selectedFolder1 != null) {
        gd.getStringFields().get(0).setText(selectedFolder1);
    }
});

gd.addStringField("Folder 2:", "", 40);
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
        print("File 1: "+fileName1)
        print("File 2: "+fileName2);
        
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

                var diffSum = 0;

                // Loop through each pixel
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var pixel1 = processor1.getPixel(x, y);
                        var pixel2 = processor2.getPixel(x, y);

                        // Calculate the absolute difference
                        var diff = Math.abs(pixel1 - pixel2);
                        diffSum += diff;
                    }
                }

                // Calculate the mean difference
                var meanDifference = diffSum / (width * height);

                // Add the result to the table
                results.incrementCounter();
                results.addValue("Image Name", file.getName());
                results.addValue("Mean Difference", meanDifference);
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


