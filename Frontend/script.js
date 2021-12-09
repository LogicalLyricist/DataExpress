const canvas = document.getElementById('demo');
const ctx = canvas.getContext('2d');

canvas.width = 1400;
canvas.height = 700;
ctx.lineWidth = 3;


function drawArc(ctx, centerX, centerY, radius, startAngle, endAngle){
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
}
function drawPieSlice(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    drawArc(ctx,centerX,centerY,radius,startAngle,endAngle)
}
function drawKey(ctx,x,y,colors,question,choices){
    x=x-Math.min(canvas.width/4,canvas.height/4)
    y=y+Math.min(canvas.width/4,canvas.height/4)*1.3  
    ctx.font = "30px Arial";
    ctx.fillStyle ="#fff";
    ctx.fillText(question,x,y,Math.min(canvas.width/4,canvas.height/4)*2);
    refY = y;
    for(var choice in choices){
        refY+=50;
        ctx.fillStyle="#fff"
        ctx.fillText(choices[choice],x+50,refY,Math.min(canvas.width/4,canvas.height/4)*2);
        ctx.fillStyle=colors[choice];
        ctx.fillRect(x+Math.min(canvas.width/4,canvas.height/4)*1.5,refY-20,20,20)
    }
}


var question1 = [];
var question2 = [];
var question3 = [];

async function fetchData(url) {
    const response = await fetch(url);
    const json = await response.json();

    return json
}
async function updateQuestions(){
    data = await fetchData('http://localhost:3000/api')
    
    info1 = data[0]
    info2 = data[1]
    info3 = data[2]

    question1 = [];
    question2 = [];
    question3 = [];
    for (var key in info1) {
        question1.push(info1[key])
    }
    for (var key in info2) {
        question2.push(info2[key])
    }
    for (var key in info3) {
        question3.push(info3[key])
    }
    question1.shift();
    question2.shift();
    question3.shift();
    console.log(question1)
    console.log(question2)
    console.log(question3)
    
}


var Piechart = function(options){
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
    this.x = options.x;
    this.y = options.y;
    this.question = options.question;
    this.choices = options.choices;
    this.data = options.data;

    this.draw = async function(){
        var total_value = 0;
        var color_index = 0;

        for(var i = 0; i < this.data.length; i++){
            var val = this.data[i];
            total_value += val;
        }
        var start_angle = 0;
        for (var i = 0; i < this.data.length; i++){
            val = this.data[i];
            var slice_angle = 2 * Math.PI * val / total_value;

            drawPieSlice(
                this.ctx,
                this.x,
                this.y,
                Math.min(this.canvas.width/4,this.canvas.height/4),
                start_angle,
                start_angle+slice_angle,
                this.colors[color_index%this.colors.length]
            );
            start_angle += slice_angle;
            color_index++;
        }
        drawKey(
            this.ctx,
            this.x,
            this.y,
            this.colors,
            this.question,
            this.choices
        )
    }
}


async function createPage(){
    await updateQuestions();
    console.log(question1)
    console.log(question2)
    console.log(question3)

    var firstChart = new Piechart(
        {
            canvas:canvas,
            data:question1,
            colors:["#fde23e","#f16e23", "#57d9ff","#937e88"],
            x:canvas.width/7.8,
            y:canvas.height/3.7,
            question:"What is your favorite pizza topping?",
            choices:["Cheese", "Pepperoni", "Pineapple", "Other"]
        }
    );
    
    var secondChart = new Piechart(
        {
            canvas:canvas,
            data:question2,
            colors:["#f23","#fe2", "#59f","#3d7"],
            x:canvas.width/2.1,
            y:canvas.height/3.7,
            question:"What is your dream superpower?",
            choices:["Flying", "Teleportation", "Invisibility", "Super strength"]
        }
    );

    var thirdChart = new Piechart(
        {
            canvas:canvas,
            data:question3,
            colors:["#dc2","#1f6", "#579","#937"],
            x:canvas.width/1.2,
            y:canvas.height/3.7,
            question:"What is your favorite movie genre?",
            choices:["Action", "Comedy", "Drama", "Horror"]
        }
    );

    firstChart.draw();
    secondChart.draw();
    thirdChart.draw();
}

createPage();