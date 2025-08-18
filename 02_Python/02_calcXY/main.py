#!/usr/bin/env python3

def calcX(inData):
    num = inData
    for i in range(1, 4, 1):  
        num = num + 2 * i
        print (num)
    return num

def calcY(inData):
    num = inData
    for i in range(2, 9, 2):
        num = num + 2 * i
        print ("i=", i, " num=", num)
    return num

def main():
    inData = 1
    print (inData)
    # calcX(1)

    print (calcY(1))
    
if __name__ == "__main__":
    main()
