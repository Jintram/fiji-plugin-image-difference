

# Library to laod tif images
import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from PIL import Image


img1_path = "/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_A/img001__4xmt_mTq2 (2657+2823 3-2657).tif"
img2_path = "/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email/image_set_B/img001__P2A_4xmts_SYFP1 (2657+2823 3-2823).tif"

# import the above two images into numpy arrays
img1 = np.array(Image.open(os.path.join(img1_path)))
img2 = np.array(Image.open(os.path.join(img2_path)))

img1_flat = img1.flatten()
img2_flat = img2.flatten()

min_val = np.min([np.percentile(img1_flat, 2), np.percentile(img2_flat, 2)])*3
max_val = np.max([np.percentile(img1_flat, 98), np.percentile(img2_flat, 98)])

img1_mask = np.logical_and(img1_flat > min_val, img1_flat < max_val)
img2_mask = np.logical_and(img2_flat > min_val, img2_flat < max_val)
combined_mask = np.logical_or(img1_mask, img2_mask)

img1_flat_sel = img1_flat[combined_mask]
img2_flat_sel = img2_flat[combined_mask]

# now plot the two images in a scatter plot
fig, ax = plt.subplots()
plt.title("Scatter plot of two images\n" + os.path.basename(img1_path) + "\n" + os.path.basename(img2_path))
# scatter plot of the two images
#ax.scatter(img1_flat, img2_flat, alpha=0.1)
# now add 2d histogram
ax.hist2d(img1_flat_sel, img2_flat_sel, bins=100, cmap='jet', norm=mcolors.PowerNorm(.05))
ax.set_xlim(0, max_val); ax.set_ylim(0, max_val)
# add x=y line
ax.plot([0, max_val], [0, max_val], 'k--', lw=1)
plt.tight_layout()
plt.show(); plt.close()