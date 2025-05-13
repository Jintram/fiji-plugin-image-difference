

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