

// Import the necessary FIJI classes
importClass(Packages.ij.gui.GenericDialog);

// Create a new GenericDialog
var gd = new GenericDialog("Input Dialog");

// Add two string fields
gd.addStringField("First String:", "");
gd.addStringField("Second String:", "");

// Add OK and Cancel buttons
gd.showDialog();

// Check if the user clicked OK
if (gd.wasOKed()) {
    // Retrieve the input values
    var firstString = gd.getNextString();
    var secondString = gd.getNextString();

    // Print the values to the console
    print("First String: " + firstString);
    print("Second String: " + secondString);
} else {
    print("Dialog was canceled.");
}