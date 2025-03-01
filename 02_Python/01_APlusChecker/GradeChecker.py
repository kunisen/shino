import math


print ("Shino's Grade Calculator!")
print ("===============================================")

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

print ("===============================================")

## Calculate Prediction Average

### First, let's not use the stdin (keyboard)
# NewAssignmentType = "Summative"
# NewPointsEarned = 10
# NewPointsPossible = 12

### Let's use keyboard input
NewAssignmentType = input("Input: New assignment Type - summative or formative: ")
NewPointsEarned = int(input("Input: New Points Earned / Points Earned Prediction: "))
NewPointsPossible = int(input("Input: New Points Possible / Points Possible Prediction: "))

print ("New assignment type is ", NewAssignmentType)

print ("New Points Earned is ", NewPointsEarned)
print ("New Points Possible is ", NewPointsPossible)

### Calculate Prediction Average Based on the input
if NewAssignmentType.lower() == "summative":
    PointsEarnedSummativePrediction = NewPointsEarned
    PointsPossibleSummativePrediction = NewPointsPossible

    AverageSummativePrediction = (SumOfPointsEarnedSummative + PointsEarnedSummativePrediction) / (SumOfPointsPossibleSummative + PointsPossibleSummativePrediction)
    RoundedUpAverageSummativePrediction = round(AverageSummativePrediction, 4) * 100
    print ("Average prediction is", RoundedUpAverageSummativePrediction)

elif NewAssignmentType.lower() == "formative":
    PointsEarnedFormativePrediction = NewPointsEarned
    PointsPossibleFormativePrediction = NewPointsPossible

    AverageForamtivePrediction = (SumOfPointsEarnedFormative + PointsEarnedFormativePrediction) / (SumOfPointsPossibleFormative + PointsPossibleFormativePrediction)
    RoundedUpAverageFormativePrediction = round(AverageForamtivePrediction, 4) * 100
    print ("Average prediction is", RoundedUpAverageFormativePrediction)

else:
    print ("wrong assignment type! needs to be either summative or formative")






