/* eslint-disable */
import "bootstrap/js/dist/util";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/tab";
import "bootstrap/js/dist/popover";
import "simplebar";

import { TweenMax, TimelineMax, Power1 } from "gsap";

$(document).ready(function() {
  $('[data-toggle="popover"]').popover({
    trigger: "hover"
  });

  const x = $(".custom-slide");

  if (x.length) {
    let currentTab = 0;
    let tl = new TimelineMax();

    tl.to(x[currentTab], {
      opacity: 1,
      display: "block"
    });

    function goToNextSlide() {
      let currentSlide = currentTab;
      let nextSlide = currentTab + 1;

      currentTab += 1;

      tl.to(x[currentSlide], 0.5, {
        opacity: 0,
        onComplete: function() {
          x[currentSlide].style.display = "none";
          x[nextSlide].style.display = "block";
        }
      });

      tl.fromTo(
        x[nextSlide],
        0.5,
        {
          opacity: 0
        },
        { opacity: 1 }
      );
    }

    $(".next-btn").on("click", e => {
      e.preventDefault();

      goToNextSlide();
    });
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  //map part

  let canvas = document.getElementById("map-canvas");

  if (canvas) {
    let ctx = canvas.getContext("2d");

    function setCanvasSize() {
      canvas.width = parseInt($(".map").width());
      canvas.height = parseInt($(".map").height());
    }

    window.onload = window.onresize = setCanvasSize();

    window.addEventListener("resize", resizeThrottler, false);

    let resizeTimeout;
    function resizeThrottler() {
      if (!resizeTimeout) {
        resizeTimeout = setTimeout(function() {
          resizeTimeout = null;
          clear();
          setCanvasSize();
          draw();
        }, 66);
      }
    }

    let raf;

    function clear() {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    function draw() {
      let pts = [];
      let headerHeight = $(".main-header").height();

      $(".point").each(function(ind, el) {
        let $this = $(this);
        let offset = $this.offset();
        let width = $this.width();
        let height = $this.height();

        let centerX = offset.left + width / 2;
        let centerY = offset.top + height / 2 - headerHeight;

        pts.push(Math.round(centerX), Math.round(centerY));
      });

      function dista(arr, i, j) {
        return Math.sqrt(
          Math.pow(arr[2 * i] - arr[2 * j], 2) +
            Math.pow(arr[2 * i + 1] - arr[2 * j + 1], 2)
        );
      }

      function va(arr, i, j) {
        return [arr[2 * j] - arr[2 * i], arr[2 * j + 1] - arr[2 * i + 1]];
      }

      function ctlpts(x1, y1, x2, y2, x3, y3) {
        let t = 1;
        let v = va(arguments, 0, 2);
        let d01 = dista(arguments, 0, 1);
        let d12 = dista(arguments, 1, 2);
        let d012 = d01 + d12;
        return [
          x2 - (v[0] * t * d01) / d012,
          y2 - (v[1] * t * d01) / d012,
          x2 + (v[0] * t * d12) / d012,
          y2 + (v[1] * t * d12) / d012
        ];
      }

      function drawSplines() {
        let cps = [];

        for (let i = 0; i < pts.length - 2; i += 1) {
          cps = cps.concat(
            ctlpts(
              pts[2 * i],
              pts[2 * i + 1],
              pts[2 * i + 2],
              pts[2 * i + 3],
              pts[2 * i + 4],
              pts[2 * i + 5]
            )
          );
        }

        drawCurvedPath(cps, pts);
      }

      function drawCurvedPath(cps, pts) {
        let len = pts.length / 2;

        if (len < 2) return;
        ctx.setLineDash([10, 20]);
        ctx.lineWidth = 15;
        ctx.strokeStyle = "#ffffff";
        if (len == 2) {
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);
          ctx.lineTo(pts[2], pts[3]);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);

          ctx.quadraticCurveTo(cps[0], cps[1], pts[2], pts[3]);

          for (var i = 2; i < len - 1; i += 1) {
            ctx.bezierCurveTo(
              cps[(2 * (i - 1) - 1) * 2],
              cps[(2 * (i - 1) - 1) * 2 + 1],
              cps[2 * (i - 1) * 2],
              cps[2 * (i - 1) * 2 + 1],
              pts[i * 2],
              pts[i * 2 + 1]
            );
          }
          ctx.quadraticCurveTo(
            cps[(2 * (i - 1) - 1) * 2],
            cps[(2 * (i - 1) - 1) * 2 + 1],
            pts[i * 2],
            pts[i * 2 + 1]
          );
          ctx.stroke();
        }
      }
      clear();
      drawSplines();

      // raf = window.requestAnimationFrame(draw);
    }
    draw();
  }

  $(".btn:not(.disabled), .btn-custom:not(.disabled)")
    .each(function(i) {
      if (i !== 0) {
        $("#btn-hover-sound")
          .clone()
          .attr("id", "btn-hover-sound-" + i)
          .appendTo($(this).parent());
      }
      $(this).data("btn-hover-sound", i);
    })
    .mouseenter(function() {
      let beep = $("#btn-hover-sound-" + $(this).data("btn-hover-sound"))[0];
      beep.volume = 0.1;
      beep.play();
    });

  $("#btn-hover-sound").attr("id", "btn-hover-sound-0");

  var activeBeep = $("#btn-active-sound")[0];
  activeBeep.volume = 0.2;

  $(".btn:not(.disabled), .btn-custom:not(.disabled)").mousedown(function(
    event
  ) {
    activeBeep.pause();
    activeBeep.play();
  });

  if ($(".particle-bg").length) {
    var _container = document.querySelector(".particle-bg__svg"),
      _boubles = document.querySelectorAll(".particle-bg__svg .circle"),
      _maxY = _container.getBBox().height,
      _maxX = _container.getBBox().width;

    function _NextBounce(bouble) {
      var r = bouble.getAttribute("r"),
        minY = r || 1,
        minX = r || 1,
        maxY = _maxY - r,
        maxX = _maxX - r,
        randY = random(minY, maxY),
        randX = random(minX, maxX);

      TweenMax.to(bouble, random(5, 10), {
        x: randX,
        y: randY,
        ease: Power1.easeInOut,
        onComplete: function() {
          _NextBounce(bouble);
        }
      });
    }

    function random(min, max) {
      if (max == null) {
        max = min;
        min = 0;
      }
      return Math.random() * (max - min) + Number(min);
    }

    // initialize
    for (var i = 0; i < _boubles.length; i++) {
      _NextBounce(_boubles[i]);
    }
  }
});


//---------------------------js-----------------------
$('.tabs__wrap').hide();
$('.tabs__wrap:first').show();
$('.tabs ul a:first').addClass('active');
 $('.tabs ul a').click(function(event){
  event.preventDefault();
  $('.tabs ul a').removeClass('active');
  $(this).addClass('active');
  $('.tabs__wrap').hide();
   var selectTab = $(this).attr('href');
  $(selectTab).fadeIn();
});



(function(){

  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

  var canvas = document.querySelector("canvas");
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "source-over";
  var particles = [];
  var pIndex = 0;
  var x, y, frameId;

  function Dot(x,y,vx,vy,color){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    particles[pIndex] = this;
    this.id = pIndex;
    pIndex++;
    this.life = 0;
    this.maxlife = 600;
    this.degree = getRandom(0,360);//開始角度をずらす
    this.size = Math.floor(getRandom(8,10));//紙吹雪のサイズに変化をつける
  };

  Dot.prototype.draw = function(x, y){

    this.degree += 1;
    this.vx *= 0.99;//重力
    this.vy *= 0.999;//重力
    this.x += this.vx+Math.cos(this.degree*Math.PI/180);//蛇行
    this.y += this.vy;
    this.width = this.size;
    this.height = Math.cos(this.degree*Math.PI/45)*this.size;//高さを変化させて、回転させてるっぽくみせる
    //紙吹雪の描写
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x+this.x/2, this.y+this.y/2);
    ctx.lineTo(this.x+this.x/2+this.width/2, this.y+this.y/2+this.height);
    ctx.lineTo(this.x+this.x/2+this.width+this.width/2, this.y+this.y/2+this.height);
    ctx.lineTo(this.x+this.x/2+this.width, this.y+this.y/2);
    ctx.closePath();
    ctx.fill();
    this.life++;
    //lifeがなくなったら紙吹雪を削除
    if(this.life >= this.maxlife){
      delete particles[this.id];
    }
  }
//リサイズ処理
  window.addEventListener("resize", function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    x = canvas.width / 2;
    y = canvas.height / 2;
  });

  function loop(){
    //全画面に色をしく。透過率をあげると残像が強くなる
    ctx.clearRect(0,0, canvas.width, canvas.height);
    //紙吹雪の量の調節
    if(frameId % 3 == 0) {
        new Dot(canvas.width*Math.random()-canvas.width+canvas.width/2*Math.random(), -canvas.height/2, -1 * getRandom(1, 3),  getRandom(2, 4),"#f43ddb");
        new Dot(canvas.width*Math.random()-canvas.width+canvas.width*Math.random(), -canvas.height/2, getRandom(1, 3),  getRandom(2, 4),"#ED1A3D");
        new Dot(canvas.width*Math.random()-canvas.width+canvas.width/2*Math.random(), -canvas.height/2, getRandom(1, 3),  getRandom(2, 4),"#ffc30c");
        new Dot(canvas.width*Math.random()+canvas.width-canvas.width*Math.random(), -canvas.height/1, getRandom(1, 3),  getRandom(2, 4),"#fff");
    }
    for(var i in particles){
      particles[i].draw();
    }
    frameId = requestAnimationFrame(loop);
  }

  loop();

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

})();