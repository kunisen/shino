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


def can_move(new_x, new_y):
    # パックマンの半径 (shapesize 1.5 ≒ 20pxくらい)
    radius = 19.9

    # チェックする4方向のオフセット
    offsets = [
        (radius, 0),  # 右
        (-radius, 0),  # 左
        (0, radius),  # 上
        (0, -radius)  # 下
    ]

    for dx, dy in offsets:
        check_x = new_x + dx
        check_y = new_y + dy

        grid_x = int((check_x + 340) // TILE_SIZE)
        grid_y = int((300 - check_y) // TILE_SIZE)

        print(f"grid_x: {grid_x}, grid_y: {grid_y}")
        print(f"xcor: {new_x + 340}, ycor: {300 - new_y}")
        print("-------------------------------------")

        # 範囲外はNG
        if grid_x < 0 or grid_x >= len(
                maze[0]) or grid_y < 0 or grid_y >= len(maze):
            return False

        # 壁タイルならNG
        if maze[grid_y][grid_x] == "1":
            return False

    return True


STEP = 20  # 移動量


def move_up():
    new_x = packman.xcor()
    new_y = packman.ycor() + STEP
    if can_move(new_x, new_y):
        packman.sety(new_y)


def move_down():
    new_x = packman.xcor()
    new_y = packman.ycor() - STEP
    if can_move(new_x, new_y):
        packman.sety(new_y)


def move_left():
    new_x = packman.xcor() - STEP
    new_y = packman.ycor()
    if can_move(new_x, new_y):
        packman.setx(new_x)


def move_right():
    new_x = packman.xcor() + STEP
    new_y = packman.ycor()
    if can_move(new_x, new_y):
        packman.setx(new_x)


gravity = -0.005
y_velocity = 0.005
x_velocity = 0.005
energy_loss = 0.0005

width = 800
height = 800

# start_y = height / 2 - height * 0.25  # = height * 0.25
# start_y = 200
start_y = 0
start_x = -40  # 真ん中スタート（お好みで調整）
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
ball.shapesize(2, 2)

# fill the top wall
fill_wall(-400, 400, 400, 400, 400, 310, -400, 310)

# fill the bottom wall
# fill_wall(-400, -400, 400, -400, 400, -350, -400, -350)
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

# draw the maze
pen = turtle.Turtle()
pen.speed(0)
pen.color("brown")
pen.penup()
pen.hideturtle()

# Maze layout (1 = wall, 0 = path)
maze = [
    "11111111111111111", "10000001000000001", "10111101001111101",
    "10100000000000101", "10101111111000101", "10001000001000001",
    "11101010101011111", "10000010101000001", "10111011101110111",
    "10000000000000001", "10111101101111101", "10000001000000001",
    "11101011101011111", "10001001001000001", "10000000000000001",
    "11111111111111111"
]
TILE_SIZE = 40  # each block is 40x40 pixels


def draw_maze():
    for y in range(len(maze)):
        for x in range(len(maze[y])):
            char = maze[y][x]
            if char == "1":  # wall
                draw_wall(x, y)


def draw_wall(x, y):
    screen_x = -340 + (x * TILE_SIZE)
    screen_y = 300 - (y * TILE_SIZE)

    pen.goto(screen_x, screen_y)
    pen.begin_fill()
    for _ in range(4):
        pen.forward(TILE_SIZE)
        pen.right(90)
    pen.end_fill()


draw_maze()
window.update()

# packman
packman = turtle.Turtle()
packman.penup()
packman.shape("circle")
packman.color("blue")
packman.shapesize(1.5, 1.5)
packman.setx(-40)
packman.sety(0)

window.update()

# 🍬 ランダムで散らばったドットを 15 個生成
# dots = []
# for _ in range(15):
#     dot = turtle.Turtle()
#     dot.shape("circle")
#     dot.color("black")
#     dot.shapesize(0.5, 0.5)  # 小さめにする
#     dot.penup()
#     x = random.randint(-300, 300)
#     y = random.randint(-300, 300)
#     dot.goto(x, y)
#     dots.append(dot)

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
    # for dot in dots:
    #     if dot.isvisible() and packman.distance(dot) < 30:
    #         dot.hideturtle()
    #         packman.color("yellow")
    #         packman.shape("square")
    #         window.update()
    #         time.sleep(0.2)
    #         packman.shape("circle")
    #         packman.color("blue")

    if packman.xcor() > 280 or packman.xcor() < -280:
        if packman.xcor() > 280:
            packman.setx(280)
        else:
            packman.setx(-280)

    if packman.ycor() > 240 or packman.ycor() < -280:
        if packman.ycor() > 240:
            packman.sety(240)
        else:
            packman.sety(-280)

    window.update()
