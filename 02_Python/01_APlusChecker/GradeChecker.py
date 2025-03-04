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

### Function - Calculate Grade with round up
def calculateGradeWithRoundUp(AverageSummative, AverageFormative):
    Grade = (AverageSummative) * 0.6 + (AverageFormative) *  0.4
    RoundedUpGrade = round(Grade, 4) * 100
    return RoundedUpGrade


## Calculate Current Average
AverageSummativeCurrent = SumOfPointsEarnedSummative / SumOfPointsPossibleSummative
AverageFormativeCurrent = SumOfPointsEarnedFormative / SumOfPointsPossibleFormative
RoundedUpGradeCurrent = calculateGradeWithRoundUp(AverageSummativeCurrent, AverageFormativeCurrent)

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
if NewAssignmentType.lower() == "summative" or NewAssignmentType.lower() == "s":
    PointsEarnedSummativePrediction = NewPointsEarned
    PointsPossibleSummativePrediction = NewPointsPossible

    AverageSummativePrediction = (SumOfPointsEarnedSummative + PointsEarnedSummativePrediction) / (SumOfPointsPossibleSummative + PointsPossibleSummativePrediction)
    AverageForamtivePrediction = AverageFormativeCurrent

elif NewAssignmentType.lower() == "formative" or NewAssignmentType.lower() == "f":
    PointsEarnedFormativePrediction = NewPointsEarned
    PointsPossibleFormativePrediction = NewPointsPossible

    AverageForamtivePrediction = (SumOfPointsEarnedFormative + PointsEarnedFormativePrediction) / (SumOfPointsPossibleFormative + PointsPossibleFormativePrediction)
    AverageSummativePrediction = AverageSummativeCurrent

else:
    print ("wrong assignment type! needs to be either summative or formative")


# Calculate grade prediction
RoundedUpGradePrediction = calculateGradeWithRoundUp(AverageSummativePrediction, AverageForamtivePrediction)

print ("Grade prediction is", RoundedUpGradePrediction)


