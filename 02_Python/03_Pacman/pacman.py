import turtle
import random  # 追加
import time


def fill_wall(x1, y1, x2, y2, x3, y3, x4, y4):
    ball.goto(x1, y1)
    ball.pendown()

    ball.color("black", "navy")

    ball.begin_fill()
    ball.goto(x2, y2)
    ball.goto(x3, y3)
    ball.goto(x4, y4)
    ball.end_fill()

    ball.penup()


def move_up():
    packman.sety(packman.ycor() + 20)


def move_down():
    packman.sety(packman.ycor() - 20)


def move_left():
    packman.setx(packman.xcor() - 20)


def move_right():
    packman.setx(packman.xcor() + 20)


gravity = -0.005
y_velocity = 0.005
x_velocity = 0.005
energy_loss = 0.0005

width = 800
height = 800

# start_y = height / 2 - height * 0.25  # = height * 0.25
# start_y = 200
start_y = 0
start_x = 0  # 真ん中スタート（お好みで調整）
end_y = height / 2 - height * 0.75  # = -height * 0.25

# Set window and ball
window = turtle.Screen()
window.setup(width, height)
window.tracer(0)

window.addshape("ninja.gif")
window.addshape("pacman.gif")

ball = turtle.Turtle()
# ball.shape("ninja.gif")  # ここで形を忍者に変更
ball.penup()
ball.hideturtle()
ball.shapesize(3, 3)

# fill the top wall
fill_wall(-400, 400, 400, 400, 400, 300, -400, 300)

# fill the bottom wall
fill_wall(-400, -400, 400, -400, 400, -350, -400, -350)

# fill the right wall
fill_wall(350, 400, 400, 400, 400, -400, 350, -400)

# fill the left wall
fill_wall(-350, 400, -400, 400, -400, -400, -350, -400)

window.update()

ball.shape("pacman.gif")
ball.penup()
ball.goto(0, 350)
ball.showturtle()

# # scattered dots
# dot = turtle.Turtle()
# dot.shape("circle")
# dot.color("black")
# dot.shapesize(1, 1)
# dot.penup()
# dot.sety(250)
# dot.setx(250)

# packman
packman = turtle.Turtle()
packman.penup()
packman.shape("circle")
# packman.shape("ninja.gif")
packman.color("blue")
packman.shapesize(3, 3)
# packman.hideturtle()

window.update()

# 🍬 ランダムで散らばったドットを 15 個生成
dots = []
for _ in range(15):
    dot = turtle.Turtle()
    dot.shape("circle")
    dot.color("black")
    dot.shapesize(0.5, 0.5)  # 小さめにする
    dot.penup()
    x = random.randint(-300, 300)
    y = random.randint(-300, 300)
    dot.goto(x, y)
    dots.append(dot)

# イベントリスナー開始
window.listen()
window.onkeypress(move_up, "Up")
window.onkeypress(move_down, "Down")
window.onkeypress(move_left, "Left")
window.onkeypress(move_right, "Right")

while True:
    packman.sety(packman.ycor())
    packman.setx(packman.xcor())

    # ドットを食べたか判定
    for dot in dots:
        if dot.isvisible() and packman.distance(dot) < 30:
            dot.hideturtle()
            packman.color("yellow")
            packman.shape("square")
            window.update()
            time.sleep(0.2)
            packman.shape("circle")
            packman.color("blue")

    # Update ball position
    # packman.sety(packman.ycor() + y_velocity)
    # packman.setx(packman.xcor() + x_velocity)

    # # Apply gravity
    # y_velocity += gravity

    # # Apply energy loss
    # y_velocity = y_velocity * (1 - energy_loss)

    # # # Wall collision detection (accounting for wall thickness)
    if packman.xcor() > 300 or packman.xcor() < -300:
        if packman.xcor() > 300:
            packman.setx(300)
        else:
            packman.setx(-300)

    if packman.ycor() > 300 or packman.ycor() < -300:
        y_velocity = -y_velocity
        if packman.ycor() > 300:
            packman.sety(300)
        else:
            packman.sety(-300)

    window.update()
