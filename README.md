


# Calculate the difference between two images

For a small research project, we wanted to quantify the similarity between two images quantitatively.

### Relation to co-localization

This is akin to co-localization, but not precisely. For more literature on co-localization, see also:
- https://imagej.net/imaging/colocalization-analysis
-  Jesse S. Aaron, Aaron B. Taylor, and Teng-Leong Chew, ‘Image Co-Localization – Co-Occurrence versus Correlation’, _Journal of Cell Science_ 131, no. 3 (8 February 2018): jcs211847, [https://doi.org/10.1242/jcs.211847](https://doi.org/10.1242/jcs.211847). **(Co-occurence \[overlap\] vs correlation.)**
- Sylvain V. Costes et al., ‘Automatic and Quantitative Measurement of Protein-Protein Colocalization in Live Cells’, _Biophysical Journal_ 86, no. 6 (June 2004): 3993–4003, [https://doi.org/10.1529/biophysj.103.038422](https://doi.org/10.1529/biophysj.103.038422). 

### Quantifying image similarity

We quantify the (dis)similarity between two images using three metrics:

- The correlation coefficient between pixels x_i of image x compared to the pixels y_i of image y.

$$
r = \frac{\sum_{i=1}^{n} (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n} (x_i - \bar{x})^2} \sqrt{\sum_{i=1}^{n} (y_i - \bar{y})^2}}
$$

where \( x_i \) and \( y_i \) are the pixel values of the two images, and \( \bar{x} \), \( \bar{y} \) are their respective means.

- 