import math


print ("Shino's Grade Calculator!")

## Environmental Variables & Data Sets Definition

### Take Bible as example
Subject = "Bible"
SumOfPointsEarnedFormative = 140
SumOfPointsPossibleFormative = 146
SumOfPointsEarnedSummative = 104
SumOfPointsPossibleSummative = 107

## Calculate Current Average
AverageSummative = SumOfPointsEarnedSummative / SumOfPointsPossibleSummative
AverageFormative = SumOfPointsEarnedFormative / SumOfPointsPossibleFormative
GradeCurrent = (AverageSummative) * 0.6 + (AverageFormative) *  0.4
RoundedUpGradeCurrent = round(GradeCurrent, 4) * 100

print ("Current Grade is ", RoundedUpGradeCurrent)
