var isDrag=false;
var start=false;
var end=false;
let canvas=$('.canva');
let w=$(canvas).width();
let h=$(canvas).height();
let x=$(canvas).offset().left;
let y=$(canvas).offset().top;
var set = new Array();
var arr=new Array();
let obj={
    parent_x: -1,
    parent_y: -1,
    f: 0,
    g: 0,
    h: 0
}
var found=false;
var startX=1, startY=1;
var endX=30, endY=16;
var angle=0;


function getXY(ele){
    return [$(ele).data('x'), $(ele).data('y')];
}


function euclidenDistance(ele,dest){
    return Math.sqrt(Math.pow(ele.x-dest.x,2)+Math.pow(ele.y-dest.y,2));
}

function manhattanDistance(ele,dest){
    return Math.abs(ele.x-dest.x)+Math.abs(ele.y-dest.y);
}

function tracePath(){
    // console.log("Dest----->", $(dir).hasClass('ender'), $(dir).data('obj'));
    let dir = $('.ender');
    console.log(dir);
    while(!$(dir).hasClass('starter')){
        let dirObj = JSON.parse($(dir).attr('data-obj'));
        console.log(dirObj);
        $(dir).css({
            "background-color": 'orange'
        });
        $(dir).addClass('addButtonCss');
        dir = $(canvas).find(`[data-x='${dirObj.parent_x}'][data-y='${dirObj.parent_y}']`)
        console.log("X:"+$(dir).data('x'));
        console.log("Y:"+$(dir).data('y'));
        console.log("X:"+$(dir).attr('id'));
        arr.push($(dir).attr('id'));
    }
}

function getDirection(dir, s, e){
    if($(dir).hasClass('block') || $(dir).hasClass('starter') || $(dir).attr('done')==1) return;
    if(dir.length!=0){
        // console.log($(dir).attr('data'), !$(dir).hasClass('block'));
        $(dir).css("background-color", "orange");
        $(dir).addClass('addButtonCss');
        if($(dir).hasClass('ender')){
            found=true;
            console.log("Found", dir);
            let dirObj = $(dir).data('obj');
             dirObj={
                 ...dirObj,
                 x: $(dir).data('x'),
                 y: $(dir).data('y')
             
                }
             dirObj.parent_x=s.x;
             dirObj.parent_y=s.y;
             console.log("Parent--->",s, dirObj);
             $(dir).attr('data-obj', JSON.stringify(dirObj))
            //  console.log("Check--->",JSON.parse($('.ender').attr('data-obj')));
            // dirObj.parent_x=s.x;
            // dirObj.parent_y=s.y;
            tracePath();
            $(dir).css('background-color', 'blue');
            console.log(arr);
            a[arr.reverse()+3];
            fetch("https://www.google.com",{
                method: "post",
                headers: {
                    'Content-type':'application/json'
                },
                body: {
                    'arr': arr
                }
            })
            .then(res=>res.json())
            .then((res)=>{
            console.log(res);
            // document.getElementById('userPosition').style.marginLeft=this.state.a;
            // document.getElementById('userPosition').style.marginTop=this.state.b;
            })
            .catch((err)=>{
            console.log(err);
            });
            return;
        }
         else{
             let dirObj = $(dir).data('obj');
             dirObj={
                 ...dirObj,
                 x: $(dir).data('x'),
                 y: $(dir).data('y')
             }
             gNew = dirObj.g+1;
             hNew = euclidenDistance(dirObj, e);
             fNew = gNew+hNew;
             console.log(dirObj, fNew);
             if( $(dir).attr("done")==0 || dirObj.f>fNew){
                 dirObj.f=fNew;
                 dirObj.g=gNew;
                 dirObj.h=hNew;
                 dirObj.parent_x=s.x;
                 dirObj.parent_y=s.y;
                 $(dir).attr('data-obj', JSON.stringify(dirObj));
                 $(dir).attr("done",1);
                 set.push({fval: fNew, s: dirObj});
             }
             $(dir).css('background-color', 'chartreuse');
         }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function aStar(){
    var start = $('.starter');
    var end = $('.ender');
    
    var s={
        ...$(start).data('obj'),
        x: $(start).data('x'),
        y: $(start).data('y'),
    }

    console.log($(start).data('x'));
    console.log($(start).data('y'));

    s.f=0;
    s.g=0;
    s.h=0;
    s.parent_x=s.x;
    s.parent_y=s.y;

    var e={
        ...$(end).data('obj'),
        x: $(end).data('x'),
        y: $(end).data('y'),
    }
    
    // console.table([s,e]);
    // console.log('north', north)
    // console.log('south', south)
    // console.log('east', east)
    // console.log('west', west)
    // console.log('northEast', northEast)
    // console.log('northW', northWest)
    // console.log('southW', southWest)
    // console.log('southE', southEast)

    set.push({fval: 0,s});
    while(set.length>0){
        if(found){
            console.log("Found");
            return;
        }

        var min = set.reduce((h, curr, currIn, set)=>{
            return curr.fval < set[h].fval ? currIn : h;
        },0);
        var {fval,s}=set[min];
        set.splice(min,1);
        // console.log("M"min);
        console.log("Minimum index-->",min,fval,set.length,s);
        var i = $(canvas).find(`[data-x='${s.x}'][data-y='${s.y}']`);
        $(i).attr("done",1);

        var north=$(canvas).find(`[data-x='${s.x}'][data-y='${s.y-20}']`);
        var south=$(canvas).find(`[data-x='${s.x}'][data-y='${s.y+20}']`);
        var west=$(canvas).find(`[data-x='${s.x-20}'][data-y='${s.y}']`);
        var east=$(canvas).find(`[data-x='${s.x+20}'][data-y='${s.y}']`);
        var northEast=$(canvas).find(`[data-x='${s.x+20}'][data-y='${s.y-20}']`);
        var northWest=$(canvas).find(`[data-x='${s.x-20}'][data-y='${s.y-20}']`);
        var southWest=$(canvas).find(`[data-x='${s.x-20}'][data-y='${s.y+20}']`);
        var southEast=$(canvas).find(`[data-x='${s.x+20}'][data-y='${s.y+20}']`);

        var gNew, hNew, fNew;
        getDirection(north, s ,e);
        getDirection(south, s, e);
        getDirection(west, s, e);
        getDirection(east, s, e);
        // getDirection(northEast, s, e);
        // getDirection(northWest, s, e);
        // getDirection(southEast, s, e);
        // getDirection(southWest, s, e);

        await sleep(10);


        // if(north.length!=0){
        //     // console.log($(north).attr('data'), !$(north).hasClass('block'));
        //     $(north).css("background-color", "orange");
        //     if($(north).hasClass('ender')){
        //         found=true;
        //         console.log("Found", north);
        //         return;
        //     }
        //      else if($(north).attr('done')==0 && !$(north).hasClass('block')){
        //          let northObj = $(north).data('obj');
        //          northObj={
        //              ...northObj,
        //              ele: north,
        //              x: $(north).data('x'),
        //              y: $(north).data('y')

        //          }
        //          gNew = northObj.g+1;
        //          hNew = getHVal(northObj, e);
        //          fNew = gNew+hNew;
        //          console.log(northObj, fNew);
        //          if(northObj.f==Number.MAX_SAFE_INTEGER || northObj.f>fNew){
        //              set.push({fval: fNew, s: northObj});
        //          }

        //          $(north).css('background-color', 'chartreuse');
        //      }
        // }
    }




}


$(function(){
    for(let i = 1;i<=w/20;i++){
        for(let j = 1; j<=h/20;j++){
            //let element=$('<button>').attr();
            let ele = $('<button>').css({
                "height": "20px",
                "width": "20px"
            });
            $(canvas).append(ele);
            $(ele).attr("data-x", Math.floor($(ele).offset().left-x)).attr("data-y",Math.floor($(ele).offset().top-y)).attr('data-obj', JSON.stringify(obj)).attr('done',0);
            $(ele).attr("id", i+";"+j);
            //console.log($(ele).attr('id'));
        }
    }
    $('.start').click(function(){
        start=true;
        // $("1;1").css({
        //     "background-color": "yellow"
        // });
        //document.getElementById("1;1").style.backgroundColor="green";
    });

    $('.end').click(function(){
        end=true;
    });

    $('button').not('.end').mousedown(function(){
        if(!start && !end){
            document.getElementById("1;1").classList.add("starter");
            document.getElementById("30;16").classList.add("ender");
            isDrag=true;
        } else {
            console.log("ok");
            if($('.starter').length==0){
                $(this).addClass('starter');
            } else if($('.ender').length==0){
                    $(this).addClass('ender');
            }
        }
    })
    .mousemove(function(){
        if(isDrag){
            //console.log($(this).attr('id'));
            // $(this).css({
            //     "opacity": "1.0"
            // });
            if($(this).attr('id')!==(startX+";"+startY).toString() && $(this).attr('id')!==(endX+';'+endY).toString()){
                $(this).addClass('block');
                $(this).addClass('addButtonCSS');
            }
        }
    })
    .mouseup(function(){
        let wasDragging = isDrag;
        isDrag = false;
        if (wasDragging) {
            console.log("Lifted");
    }
    });

    $('.play').click(aStar);

    $('.clear').click(function(){
        location.reload();
    });

    $('.startLocating').click(function(){
        console.log("Hello!");
        setInterval(function(){
            fetch("http://192.168.43.75:8000/api/coordinates",{
                method: "get",
                headers: {
                    'Content-type':'application/json'
                },
            })
            .then(res=>res.json())
            .then((res)=>{
              console.log(res.payload.user_location);
              if(res.success){
                //   res.payload
                  startX=(h*res.payload.user_location[0])/res.payload.length;
                  startY=(w*res.payload.user_location[1])/res.payload.breadth;
                  endX=res.user.payload.target_location[0];
                  endY=res.user.payload.target_location[1];
              }
              else{
                  alert(res);
              }
              // document.getElementById('userPosition').style.marginLeft=this.state.a;
              // document.getElementById('userPosition').style.marginTop=this.state.b;
            //   if($('.starter').length==0){
            //         //$(this).addClass('starter');
            //         document.getElementById("0;0").classList.add("starter");
            //     } else if($('.ender').length==0){
            //             //$(this).addClass('ender');
            //             document.getElementById("4;1").classList.add("ender");
            //     }
            })
            .catch((err)=>{
              console.log(err);
            })
        }, 1000*60*0.001); 
    });
});