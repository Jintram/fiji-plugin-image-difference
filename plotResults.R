

library(ggplot2)


# import the data
df_celldistances = read.csv('/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testimages.csv')
# df_celldistances = read.csv('/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/202505_testset-email_Results.csv')
    # View(df_celldistances)


# Sanitize the names
df_celldistances$Image.Name.New = df_celldistances$Image.Name
df_celldistances$Image.Name.New = gsub("\\(.*[.]tif", "", df_celldistances$Image.Name.New)
df_celldistances$Image.Name.New = gsub("^img", "(", df_celldistances$Image.Name.New)
df_celldistances$Image.Name.New = gsub("__", ") ", df_celldistances$Image.Name.New)
    # View(df_celldistances)


# now plot RMSD
ggplot(df_celldistances)+
    geom_boxplot(aes(x= Image.Name.New, y=RMSD), outlier.shape = NA)+
    geom_jitter(aes(x= Image.Name.New, y=RMSD), alpha=.5)+
    # rotate text 90 degrees
    theme(axis.text.x = element_text(angle = 90, hjust = 1))+
    theme_bw()

# now plot Correlation
ggplot(df_celldistances)+
    geom_boxplot(aes(x= Image.Name.New, y=Pearson.Corr), outlier.shape = NA)+
    geom_jitter(aes(x= Image.Name.New, y=Pearson.Corr), alpha=.5)+
    # rotate text 90 degrees
    theme(axis.text.x = element_text(angle = 90, hjust = 1))+
    theme_bw()

# now plot Mean difference
ggplot(df_celldistances)+
    geom_boxplot(aes(x= Image.Name.New, y=Mean.Difference), outlier.shape = NA)+
    geom_jitter(aes(x= Image.Name.New, y=Mean.Difference), alpha=.5)+
    # rotate text 90 degrees
    theme(axis.text.x = element_text(angle = 90, hjust = 1))+
    theme_bw()



# Combine all plots with facets
# First melt the dataframe
library(tidyverse)
df_celldistances.melt = df_celldistances %>%
    # select(Image.Name.New, RMSD, Pearson.Corr, Mean.Difference) %>%
    pivot_longer(cols = c(RMSD, Pearson.Corr, Mean.Difference), names_to = "Metric", values_to = "Value")
    # View(df_celldistances.melt)
# Rename the metrics
df_celldistances.melt$MetricNew = df_celldistances.melt$Metric
rename_lookup = c("RMSD" = "RMSD", "Pearson.Corr" = "Corr", "Mean.Difference" = "Diff")
df_celldistances.melt$MetricNew = rename_lookup[df_celldistances.melt$MetricNew]
# Set the order of the different metrics
df_celldistances.melt$Metric.F = factor(df_celldistances.melt$Metric, levels = c("Pearson.Corr", "RMSD", "Mean.Difference"))
df_celldistances.melt$MetricNew.F = factor(df_celldistances.melt$MetricNew, levels = c("Corr", "RMSD", "Diff"))
    # View(df_celldistances.melt)


# now plot all metrics in one plot
p = ggplot(df_celldistances.melt)+
    geom_boxplot(aes(x= Image.Name.New, y=Value), outlier.shape = NA)+
    geom_jitter(aes(x= Image.Name.New, y=Value), alpha=.5)+
    # facet in multiple columns, each with their own y-axis that is independent
    facet_wrap(~MetricNew.F, ncol = 3, scales = "free_y")+
    #facet_grid(col = vars(MetricNew))+
    labs(x = element_blank(), y = "Image (dis)similarity")+
    theme_bw()+
    theme(axis.text.x = element_text(angle = 45, hjust = 1))
print(p) 

# now save this plot
if FALSE:
    # For testset
    ggsave("/Users/m.wehrens/Documents/git_repos/_UVA/2025_fiji-plugin-playground/images/plots_testset.png", 
           plot = p, width = 15, height = 6, dpi = 300, units = "cm", device = "png")
    # For testset
    ggsave("/Users/m.wehrens/Data_UVA/2025_05_Isabelle_p2a-localization/DATA/plots_testimages.png", 
           plot = p, width = 15, height = 9, dpi = 300, units = "cm", device = "png")

