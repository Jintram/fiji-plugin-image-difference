


// This is a script intended as FIJI macro 

/* 

Script that opens a folder and calculates the mean
intensity of each image in it.

This script is intended to learn myself some things
about FIJI, and was mostly generated with
ChatGPT-4o (co-pilot).

MW 2025/05

*/

// Import necessary classes
importClass(Packages.ij.IJ);
importClass(Packages.ij.measure.ResultsTable);


// Prompt the user to select a folder
importClass(Packages.ij.io.DirectoryChooser);
var dirChooser = new DirectoryChooser("Select a folder containing images");
var folderPath = dirChooser.getDirectory();
if (folderPath == null) {
    IJ.log("No folder selected. Exiting script.");
    exit();
}

// Get the list of image files in the folder
var folder = new java.io.File(folderPath);
var files = folder.listFiles();

// Create a ResultsTable to store the results
var results = new ResultsTable();

// Loop through each file in the folder
for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file.isFile() && file.getName().endsWith(".tif")) {
        
        // Open the image
        var image = IJ.openImage(file.getAbsolutePath());
        
        if (image != null) {
            // Calculate the mean intensity
            image.show();
            IJ.run("Measure");
            var stats = image.getStatistics();
            var meanIntensity = stats.mean;

            // Add the result to the table
            results.incrementCounter();
            results.addValue("Image Name", file.getName());
            results.addValue("Mean Intensity", meanIntensity);

            // Close the image
            image.close();
        }
    }
}

// Show the results table
results.show("Mean Intensity Results");