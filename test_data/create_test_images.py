

################################################################################
# GENERATING TEST IMAGES
#
# This file generates three sets of test 16 bit images
# img1a__test.tif and img1b__test.tif,
#       which have a random gaussian distribution of pixel values
# img1a__test.tif and img1b__test.tif, 
#       where img1a__test.tif has a random distribution of pixel values, but 
#       1b has pixel values such that y_i = a * x_i with a a constant (perfect correlation)
# img1a__test.tif and img1b__test.tif, 
#       where img1a__test.tif has a random distribution of pixel values, but 
#       1b has pixels values such that y_i = a * x_j + b * y'_i (partial correlation)

EXPORT_DIRECTORY = '/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testimages/'

# load libraries
import numpy as np
from tifffile import imsave
import matplotlib.pyplot as plt
import os

import tifffile as tif

################################################################################

# create the images
# Image parameters
img_shape = (256, 256)
the_dtype = np.uint16
the_scale = 2**10
a = 2
b = 0.5

# 1. Random gaussian distribution
img1a = np.random.normal(loc=2**15, scale=the_scale, size=img_shape).clip(0, 2**16-1).astype(the_dtype)
img1b = np.random.normal(loc=2**15, scale=the_scale, size=img_shape).clip(0, 2**16-1).astype(the_dtype)

# 2. Perfect correlation: y_i = a * x_i
img2a = np.random.normal(loc=2**10, scale=the_scale/5, size=img_shape).clip(0, 2**16-1).astype(the_dtype)
img2b = (a * img2a).clip(0, 2**16-1).astype(the_dtype)

# 3. Partial correlation: y_i = a * x_j + b * y'_i
img3a = np.random.normal(loc=2**10, scale=the_scale/5, size=img_shape).clip(0, 2**16-1).astype(the_dtype)
img3a_prime = np.random.normal(loc=2**10, scale=the_scale/5, size=img_shape).clip(0, 2**16-1).astype(the_dtype)
img3b = (b * img3a + (1-b) * img3a_prime).clip(0, 2**16-1).astype(the_dtype)


# Create scatter plots for all three
plt.scatter(img1a.flatten(), img1b.flatten(), alpha=.1)
plt.axis('equal')
plt.savefig(EXPORT_DIRECTORY + "img1a_img1b.png", dpi=300)
plt.close("all")

plt.scatter(img2a.flatten(), img2b.flatten(), alpha=.01)
plt.axis('equal')
plt.savefig(EXPORT_DIRECTORY + "img2a_img2b.png", dpi=300)
plt.close("all")

plt.scatter(img3a.flatten(), img3b.flatten(), alpha=.1)
plt.savefig(EXPORT_DIRECTORY + "img3a_img3b.png", dpi=300)
plt.close("all")


# save the images to directory EXPORT_DIRECTORY
os.makedirs(EXPORT_DIRECTORY + "set_a", exist_ok=True)
os.makedirs(EXPORT_DIRECTORY + "set_b", exist_ok=True)
imsave(EXPORT_DIRECTORY + "set_a/img1a_test.tif", img1a)
imsave(EXPORT_DIRECTORY + "set_b/img1b_test.tif", img1b)
imsave(EXPORT_DIRECTORY + "set_a/img2a_test.tif", img2a)
imsave(EXPORT_DIRECTORY + "set_b/img2b_test.tif", img2b)
imsave(EXPORT_DIRECTORY + "set_a/img3a_test.tif", img3a)
imsave(EXPORT_DIRECTORY + "set_b/img3b_test.tif", img3b)



################################################################################
# EXAMPLE IMAGES

# Create a new set of images, which re-create the same sets as above, 
# but in 16x16 format, and only with 16 colors.

EXPORT_DIRECTORY_EXAMPLE = '/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_exampleimages/'
os.makedirs(EXPORT_DIRECTORY_EXAMPLE, exist_ok=True)

# Parameters for small images
small_img_shape = (16, 16)
num_colors = 16
max_range = (2**16-1)
scale_factor = max_range / num_colors

# 1. Small random gaussian distribution
small1a = (np.round(np.random.normal(loc=num_colors/2, scale=num_colors/5, size=small_img_shape))*scale_factor).clip(0, 2**16-1).astype(the_dtype)
small1b = (np.round(np.random.normal(loc=num_colors/2, scale=num_colors/5, size=small_img_shape))*scale_factor).clip(0, 2**16-1).astype(the_dtype)
plt.scatter(small1a.flatten(), small1b.flatten(), alpha=.1)
plt.axis('equal')
plt.savefig(EXPORT_DIRECTORY_EXAMPLE + "smallimg1a_smallimg1b.png", dpi=300)
plt.close("all")
imsave(EXPORT_DIRECTORY_EXAMPLE + "img1__a_test_16x16.tif", small1a)
imsave(EXPORT_DIRECTORY_EXAMPLE + "img1__b_test_16x16.tif", small1b)

# 2. Perfect correlation: y_i = a * x_i
small2a = (np.round(np.random.normal(loc=num_colors/4, scale=num_colors/20, size=small_img_shape)) * scale_factor).clip(0, 2**16-1).astype(the_dtype)
small2b = (a * small2a).clip(0, 2**16-1).astype(the_dtype)
plt.scatter(small2a.flatten(), small2b.flatten(), alpha=.1)
plt.axis('equal')
plt.savefig(EXPORT_DIRECTORY_EXAMPLE + "smallimg2a_smallimg2b.png", dpi=300)
plt.close("all")
imsave(EXPORT_DIRECTORY_EXAMPLE + "img2__a_test_16x16.tif", small2a)
imsave(EXPORT_DIRECTORY_EXAMPLE + "img2__b_test_16x16.tif", small2b)

# 3. Partial correlation: y_i = a * x_j + b * y'_i
b=.8 # higher similarity
small3a = (np.round(np.random.normal(loc=num_colors/4, scale=num_colors/20, size=small_img_shape)) * scale_factor).clip(0, 2**16-1).astype(the_dtype)
small3a_prime = (np.round(np.random.normal(loc=num_colors/4, scale=num_colors/20, size=small_img_shape)) * scale_factor).clip(0, 2**16-1).astype(the_dtype)
small3b = (b * small3a + (1 - b) * small3a_prime).clip(0, 2**16-1)
plt.scatter(small3a.flatten(), small3b.flatten(), alpha=.1)
plt.axis('equal')
plt.savefig(EXPORT_DIRECTORY_EXAMPLE + "smallimg3a_smallimg3b.png", dpi=300)
plt.close("all")
imsave(EXPORT_DIRECTORY_EXAMPLE + "img3__a_test_16x16.tif", small3a)
imsave(EXPORT_DIRECTORY_EXAMPLE + "img3__b_test_16x16.tif", small3b)


################################################################################

img2a_reloaded_path = '/Users/m.wehrens/Documents/git_repos/_UVA/2025_fiji-plugin-playground/example_data/images_A/img2__a_test_16x16.tif'
img2b_reloaded_path = '/Users/m.wehrens/Documents/git_repos/_UVA/2025_fiji-plugin-playground/example_data/images_B/img2__b_test_16x16.tif'
# load the image
img2a_reloaded = np.array(tif.imread(img2a_reloaded_path))
img2b_reloaded = np.array(tif.imread(img2b_reloaded_path))

# now plot
plt.imshow(img2a_reloaded, cmap='gray'); plt.show(); plt.close()
# plot scatter
plt.scatter(img2a_reloaded.flatten(), img2b_reloaded.flatten(), alpha=.1); plt.show(); plt.close()

# calculate correlation between the two
from scipy.stats import pearsonr
corr, p_value = pearsonr(img2a_reloaded[img2a_reloaded>0].flatten(), img2b_reloaded[img2a_reloaded>0].flatten())
corr
