var paintApp = angular.module('paintApp', ['ngAnimate','ui.bootstrap','dndLists']);

paintApp.controller('paintCtrl', function($rootScope, $scope, $filter, $http, $compile) {  
    
    /*Scope's internal variables*/
    var fLevel = []
    ,sLevel = []
    ,cursorSprite = new PIXI.Graphics()
    ,loaderTl = new TimelineMax()
    ,isChrome = !!window.chrome && !!window.chrome.webstore
    ;

    /*Utility functions for the Scope's internal use*/

    //Extend PIXI.Graphics to modify its _renderWebGL function
    function GraphicsNoBlending() {
        PIXI.Graphics.call(this);
    }

    GraphicsNoBlending.prototype = Object.create(PIXI.Graphics.prototype);
    GraphicsNoBlending.prototype.constructor = GraphicsNoBlending;
    GraphicsNoBlending.prototype._renderWebGL = function (renderer) {

        //////////////copy-paste from PIXI.Graphics._renderWebGL
        if (this.glDirty)
        {
            this.dirty = true;
            this.glDirty = false;
        }

        renderer.setObjectRenderer(renderer.plugins.graphics);
        //////////////////////////

        var gl = renderer.gl;
        gl.disable(gl.BLEND);
        renderer.plugins.graphics.render(this);
        gl.enable(gl.BLEND);
    }

    //Animation loop
    function animate() {
        requestAnimationFrame(animate);
        app.renderer.render(app.stage);
        app2.renderer.render(app2.stage);
        app3.renderer.render(app3.stage);
        app4.renderer.render(app4.stage);
    }

    //Functions converting HSL to RGB values
    function hsl2rgb(h, s, l) {
        var m1, m2, hue;
        var r, g, b
        s /=100;
        l /= 100;
        if (l <= 0.5)
            m2 = l * (s + 1);
        else
            m2 = l + s - l * s;
        m1 = l * 2 - m2;
        hue = h / 360;
        r = Math.round(hueToRgb(m1, m2, hue + 1/3));
        g = Math.round(hueToRgb(m1, m2, hue));
        b = Math.round(hueToRgb(m1, m2, hue - 1/3));
        return rgbToHex(r, g, b);
    }

    function hueToRgb(m1, m2, hue) {
        var v;
        if (hue < 0)
            hue += 1;
        else if (hue > 1)
            hue -= 1;

        if (6 * hue < 1)
            v = m1 + (m2 - m1) * hue * 6;
        else if (2 * hue < 1)
            v = m2;
        else if (3 * hue < 2)
            v = m1 + (m2 - m1) * (2/3 - hue) * 6;
        else
            v = m1;

        return 255 * v;
    }

    //Functions converting RGB to HEX values    
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    //Function to get neighbour elements
    function getInArray(el, arr, coords, type){
        var currArr, foundEl;  
        for(var i = 0; i < arr.length; i++){
            currArr = arr[i];
            if(type == 'greyscale' || type == 'matched'){
                foundEl = $filter('filter')(arr, {x:coords.x, y:coords.y})
                if(foundEl.length > 0){
                    return el[arr.indexOf(foundEl[0])];
                }
            }else{
                foundEl = $filter('filter')(currArr.colors, {x:coords.x, y:coords.y})
                if(foundEl.length > 0){
                    return el[currArr.colors.indexOf(foundEl[0])];
                }
            }
        }
        return false;
    }

    //Function to draw part of canvas used in image making
    function extractRegion(renderer, x, y, width, height){
        var sourceCanvas = renderer.extract.canvas();
        var sourceContext = sourceCanvas.getContext('2d');
        var extractCanvas = document.createElement('canvas');
        var extractContext = extractCanvas.getContext('2d');
        var imageData = sourceContext.getImageData(x, y, width, height);
        
        extractCanvas.width = width;
        extractCanvas.height = height;
        extractContext.putImageData(imageData, 0, 0);
        return extractCanvas.toDataURL(1);
    }

    //Function to add Paint or Erase graphics to scene
    function addPaintGraphic(graphics, paintPointArr, coords, alpha){
        switch($scope.pageOptions.paintBrush){
            case 'line':
                graphics.lineStyle(5, $scope.fillColor, alpha);
                if(paintPointArr.length > 0){
                    graphics.moveTo(paintPointArr[paintPointArr.length - 1].x, paintPointArr[paintPointArr.length - 1].y)
                    graphics.lineTo(coords.x, coords.y);
                }
                paintPointArr.push({x:coords.x, y:coords.y});
            break;
            case 'circ':
                graphics.beginFill($scope.fillColor, alpha);
                graphics.drawCircle(coords.x - $scope.pageOptions.paintRadius/2, coords.y - $scope.pageOptions.paintRadius/2, $scope.pageOptions.paintRadius);
                graphics.endFill();
            break;
            case 'sq':
                graphics.beginFill($scope.fillColor, alpha);
                graphics.drawRect(coords.x - $scope.pageOptions.paintRadius/2, coords.y - $scope.pageOptions.paintRadius/2, $scope.pageOptions.paintRadius, $scope.pageOptions.paintRadius);
                graphics.endFill();
            break;    
        }
        app3.stage.addChild(graphics);
    }

    //Function to Zoom in/out
    function zoom(app, coords, zoomIn){
        //console.log(coords.x, coords.y, zoomIn);
        var s = zoomIn ? 2 : app.stage.scale.x == 1 ? 1 : 0.5
        ,worldPos = {x: (coords.x - app.stage.x) / app.stage.scale.x, y: (coords.y - app.stage.y)/app.stage.scale.y}
        ,newScale = {x: app.stage.scale.x * s, y: app.stage.scale.y * s}
        ,newScreenPos = {x: (worldPos.x ) * newScale.x + app.stage.x, y: (worldPos.y) * newScale.y + app.stage.y}
        ;
        if(newScale.x == 1 && !zoomIn){
            app.stage.x = 0 ;
            app.stage.y = 0 ;
        }else{
            app.stage.x -= (newScreenPos.x-coords.x);
            app.stage.y -= (newScreenPos.y-coords.y);
        }
        app.stage.scale.x = newScale.x;
        app.stage.scale.y = newScale.y;
    }

    //Function to clear a PIXI stage
    function clearStage(app){
        while(app.stage.children.length > 0){   
            app.stage.removeChild(app.stage.getChildAt(0));
        }
    }

    //Function to update graphics 
    function updateGraphicProps(graphic, props) {
          var graphicsData = graphic.graphicsData
          ,keys = Object.keys(props)
          ,jlen = keys.length
          ,ilen
          ,key
          ,shape
          ;
          // Update the props on the graphic.
          for (var j = 0; j < jlen; j++) {
            key = keys[j];
            graphic[key] = props[key];
          }
          // Update the props for each shape.
          for (var i = 0, ilen = graphicsData.length; i < ilen; i++) {
            shape = graphicsData[i];
            for (j = 0; j < jlen; j++) {
              key = keys[j];
              shape[key] = props[key];
            }
          }
          graphic.dirty++;
          graphic.clearDirty++;
    }

    //Function to download Image uri link
    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }

    $scope.reset = function(){
        $scope.pageOptions = {
            sceneOption:'startPaint',
           /* startPaint:false,
            exploreColor:false,
            paintScene:false,*/
            showMatchColors:false,
            showColorWall:false,
            histColor:false,
            compColor:true,
            showSampleScenes:false,
            showUploadScene:false,
            activePaintScTab:'Select',
            paintBrush:'line',
            paintBrushOpt:'line',
            showPaintOpts:true
        }; 
        $(".paint-tab.active").removeClass("active");
    }

    $scope.resetExpColorTabs = function(){
        $scope.pageOptions.showColorWall = false;
        $scope.pageOptions.showMatchColors = false;
    }  

    $scope.resetColorTabs = function(){
        $scope.pageOptions.histColor = false;
        $scope.pageOptions.compColor = false;
    }  

    $scope.resetPaintScTabs = function(){
        $scope.pageOptions.showSampleScenes = false;
        $scope.pageOptions.showUploadScene = false;
    }  

    $scope.reset();

    $scope.pageOptions.sceneOption = 'startPaint';
    $scope.cursorSprite = cursorSprite;

    if(isChrome){
        loaderTl
        .set("img#anim2", {css:{clipPath:"inset(0px 0px 250px)"}});    
    }
    loaderTl
    .to("img#anim1", 1, {opacity:1, top:50, ease:Back.easeOut})
    .to("img#anim3", 1, {opacity:1, rotationY:360})        
    .to("img#anim3", 1, {top:45, left:-30}, "slideDown")        
    .to("img#anim2", 1, {opacity:1}, "slideDown")

    if(isChrome){
        loaderTl
        .to("img#anim2", 1, {clipPath:"inset(0px 0px 0px)"}, "slideDown")    
    }

    loaderTl
    .to("button#anim4", 1, {opacity:1})

    //$scope.pageOptions.showUploadScene = true;
    $scope.presetBgArr = [
        {
            url:'images/int/bg1.jpg', 
            maps:[
                {   
                    groupId : 1,
                    areaMap : [
                        {x: 207, y: 0},{x: 273, y: 51},{x: 298, y: 50},{x: 311, y: 59},{x: 923, y: 58},{x: 989, y: 0}
                    ],
                    holeMap : [
                    ]
                },{ 
                    groupId : 2,                    
                    areaMap : [
                        {x: 923, y: 58},{x: 989, y: 0},{x: 1169, y: 0},{x: 1169, y: 490},{x: 922, y: 409}
                    ],
                    holeMap : [
                        [{x: 950, y: 327},{x: 1100, y: 333},{x: 1100, y: 175},{x: 950, y: 224}]
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 273, y: 51},{x: 298, y: 50},{x: 311, y: 59},{x: 923, y: 58}, {x: 922, y: 409},{x: 917, y: 419},{x: 889, y: 417},{x: 846, y: 417},{x: 825, y: 420},{x: 769, y: 417},{x: 771, y: 404},{x: 824, y: 407},{x: 839, y: 377},{x: 845, y: 344},{x: 887, y: 346},{x: 891, y: 119},{x: 763, y: 118},{x: 766, y: 300},{x: 809, y: 300},{x: 813, y: 348},{x: 763, y: 348},{x: 757, y: 349},{x: 727, y: 344},{x: 726, y: 341},{x: 695, y: 337},{x: 678, y: 339},{x: 676, y: 121},{x: 542, y: 122},{x: 546, y: 338},{x: 533, y: 339},{x: 519, y: 341},{x: 517, y: 346},{x: 502, y: 351},{x: 462, y: 352},{x: 463, y: 118},{x: 330, y: 118},{x: 330, y: 350},{x: 409, y: 352},{x: 413, y: 385},{x: 408, y: 421},{x: 336, y: 422},{x: 314, y: 423},{x: 315, y: 430},{x: 304, y: 435},{x: 244, y: 435},{x: 241, y: 133},{x: 273, y: 132}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 434, y: 371},{x: 444, y: 393},{x: 487, y: 392},{x: 489, y: 371}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 571, y: 373},{x: 591, y: 374},{x: 590, y: 388},{x: 591, y: 408},{x: 592, y: 421},{x: 574, y: 420},{x: 569, y: 407},{x: 573, y: 393}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 424, y: 411},{x: 424, y: 421},{x: 463, y: 421},{x: 460, y: 431},{x: 485, y: 432},{x: 483, y: 408},{x: 411, y: 412}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 663, y: 380},{x: 674, y: 380},{x: 676, y: 393},{x: 673, y: 416},{x: 662, y: 418},{x: 661, y: 411},{x: 662, y: 377}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 804, y: 390},{x: 770, y: 388},{x: 769, y: 367},{x: 813, y: 366}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 698, y: 413},{x: 696, y: 428},{x: 743, y: 430},{x: 742, y: 417}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 536, y: 432.33333587646484},{x: 515, y: 430.33333587646484},{x: 516, y: 418.33333587646484},{x: 549, y: 416.33333587646484},{x: 563, y: 414.33333587646484},{x: 564, y: 422.33333587646484},{x: 537, y: 422.33333587646484},{x: 536, y: 428.33333587646484}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 4,                    
                    areaMap : [
                        {x: 273, y: 51},{x: 273, y: 132},{x: 241, y: 133},{x: 244, y: 435},{x: 172, y: 459},{x: 171, y: 418},{x: 128, y: 416},{x: 126, y: 282},{x: 156, y: 279},{x: 139, y: 218},{x: 106, y: 218},{x: 95, y: 277},{x: 119, y: 284},{x: 122, y: 412},{x: 39, y: 414},{x: 21, y: 371},{x: 0, y: 371},{x: 0, y: 0},{x: 206, y: 0}
                    ],
                    holeMap : [
                    ]
                }
            ]
        },
        {
            url:'images/int/bg2.jpg', 
            maps:[
                {   
                    groupId : 1,
                    areaMap : [
                       {x: 0, y: 42},{x: 240, y: 139},{x: 800, y: 136},{x: 927, y: 47},{x: 1128, y: 0},{x:0,y:0}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 2,
                    areaMap : [
                        {x: 802, y: 136},{x: 804, y: 181},{x: 231, y: 183},{x: 231, y: 136},{x: 239, y: 137}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 928.4545516967773, y: 42.64204406738281},{x: 800.4545516967773, y: 136.6420440673828},{x: 804.4545516967773, y: 352.6420440673828},{x: 881.4545516967773, y: 383.6420440673828},{x: 882.4545516967773, y: 282.6420440673828},{x: 871.4545516967773, y: 284.6420440673828},{x: 868.4545516967773, y: 351.6420440673828},{x: 825.4545516967773, y: 339.6420440673828},{x: 826.4545516967773, y: 161.6420440673828},{x: 870.4545516967773, y: 139.6420440673828},{x: 868.4545516967773, y: 239.6420440673828},{x: 929.4545516967773, y: 244.6420440673828},{x: 927, y: 50}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 929.5, y: 282},{x: 929.5, y: 542},{x: 903.5, y: 517},{x: 903.5, y: 389},{x: 886.5, y: 379},{x: 886.5, y: 285}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 4,
                    areaMap : [
                        {x: 931.5, y: 42},{x: 1129.5, y: 1},{x: 1168.5, y: 2},{x: 1167.5, y: 595},{x: 1107.5, y: 582},{x: 1105.5, y: 548},{x: 1050.5, y: 534},{x: 1047.5, y: 505},{x: 1058.5, y: 499},{x: 1068.5, y: 457},{x: 1061.5, y: 409},{x: 1069.5, y: 406},{x: 1072.5, y: 420},{x: 1084.5, y: 399},{x: 1098.5, y: 417},{x: 1095.5, y: 440},{x: 1109.5, y: 446},{x: 1116.5, y: 423},{x: 1087.5, y: 373},{x: 1116.5, y: 373},{x: 1098.5, y: 363},{x: 1064.5, y: 365},{x: 1062.5, y: 358},{x: 1089.5, y: 349},{x: 1120.5, y: 349},{x: 1082.5, y: 337},{x: 1060.5, y: 350},{x: 1097.5, y: 313},{x: 1115.5, y: 313},{x: 1093.5, y: 306},{x: 1067.5, y: 324},{x: 1085.5, y: 293},{x: 1111.5, y: 273},{x: 1081.5, y: 277},{x: 1074.5, y: 280},{x: 1093.5, y: 251},{x: 1107.5, y: 248},{x: 1083.5, y: 253},{x: 1072.5, y: 268},{x: 1095.5, y: 219},{x: 1138.5, y: 178},{x: 1090.5, y: 210},{x: 1073.5, y: 246},{x: 1058.5, y: 280},{x: 1052.5, y: 214},{x: 1047.5, y: 290},{x: 1027.5, y: 263},{x: 1015.5, y: 249},{x: 1021.5, y: 221},{x: 1011.5, y: 244},{x: 971.5, y: 230},{x: 971.5, y: 230},{x: 1007.5, y: 255},{x: 1002.5, y: 305},{x: 987.5, y: 314},{x: 973.5, y: 295},{x: 955.5, y: 291},{x: 990.5, y: 331},{x: 1004.5, y: 359},{x: 968.5, y: 327},{x: 936.5, y: 369},{x: 993.5, y: 386},{x: 965.5, y: 390},{x: 943.5, y: 412},{x: 987.5, y: 396},{x: 951.5, y: 440},{x: 985.5, y: 410},{x: 983.5, y: 436},{x: 994.5, y: 408},{x: 1007.5, y: 393},{x: 1001.5, y: 428},{x: 1006, y: 468},{x: 1007.5, y: 427},{x: 1013.5, y: 396},{x: 1021.5, y: 430},{x: 1029.5, y: 448},{x: 1043.5, y: 464},{x: 1041.5, y: 531},{x: 1017.5, y: 527},{x: 986.5, y: 544},{x: 986.5, y: 553},{x: 931.5, y: 542}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 4,
                    areaMap : [
                        {x: 998.5, y: 381},{x: 976.5, y: 371},{x: 953.5, y: 365},{x: 970.5, y: 358},{x: 1000.5, y: 372}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 4,
                    areaMap : [
                        {x: 1019.5, y: 393},{x: 1029.5, y: 404},{x: 1029.5, y: 419},{x: 1037.5, y: 406},{x: 1047.5, y: 427},{x: 1042.5, y: 456},{x: 1026.5, y: 433},{x: 1018.5, y: 393}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 4,
                    areaMap : [
                        {x: 1049.5, y: 441},{x: 1054.5, y: 457},{x: 1060.5, y: 439},{x: 1061.5, y: 471},{x: 1056.5, y: 490},{x: 1048.5, y: 501}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 5,
                    areaMap : [
                        {x: 805.5, y: 182},{x: 804.5, y: 347},{x: 763.5, y: 349},{x: 754.5, y: 344},{x: 750.5, y: 349},{x: 695.5, y: 351},{x: 691.5, y: 402},{x: 605.5, y: 400},{x: 603.5, y: 389},{x: 579.5, y: 387},{x: 573.5, y: 397},{x: 571.5, y: 403},{x: 343.5, y: 399},{x: 341.5, y: 350},{x: 281.5, y: 349},{x: 279.5, y: 344},{x: 230.5, y: 347},{x: 231.5, y: 182}
                    ],
                    holeMap : [ 
                        [{x: 392.5, y: 233},{x: 402.5, y: 233},{x: 404.5, y: 335},{x: 392.5, y: 335}],
                        [{x: 583.5, y: 240},{x: 583.5, y: 327},{x: 435.5, y: 326},{x: 436.5, y: 240}],
                        [{x: 618.5, y: 232},{x: 629.5, y: 234},{x: 629.5, y: 334},{x: 617.5, y: 335}],
                        [{x: 490.5, y: 360},{x: 535.5, y: 360},{x: 535.5, y: 374},{x: 491.5, y: 374}]
                    ]
                }
            ]
        },
        {
            url:'images/int/bg3.jpg', 
            maps:[
                {   
                    groupId : 1,
                    areaMap : [
                        {x: 39.5, y: 0},{x: 252.5, y: 69},{x: 333.5, y: 35},{x: 515.5, y: 113},{x: 945.5, y: 0}
                    ],
                    holeMap : [                        
                    ]
                },{ 
                    groupId : 2,                    
                    areaMap : [
                        {x: 333.5, y: 35},{x: 515.5, y: 113},{x: 945.5, y: 0},{x:1170, y:0},{x: 1169.5, y: 454},{x: 1157.5, y: 440},{x: 1142.5, y: 445},{x: 1140.5, y: 463},{x: 1145.5, y: 467},{x: 1145.5, y: 476},{x: 1141.5, y: 496},{x: 1132.5, y: 489},{x: 1083.5, y: 480},{x: 1062.5, y: 485},{x: 1049.5, y: 498},{x: 1047.5, y: 391},{x: 1012.5, y: 389},{x: 1008.5, y: 372},{x: 1020.5, y: 374},{x: 1009.5, y: 353},{x: 979.5, y: 349},{x: 986.5, y: 44},{x: 856.5, y: 72},{x: 847.5, y: 395},{x: 596.5, y: 391},{x: 596.5, y: 270},{x: 606.5, y: 270},{x: 602.5, y: 256},{x: 614.5, y: 244},{x: 619.5, y: 225},{x: 594.5, y: 231},{x: 587.5, y: 249},{x: 563.5, y: 265},{x: 581.5, y: 264},{x: 586.5, y: 270},{x: 591.5, y: 273},{x: 591.5, y: 389},{x: 527.5, y: 385},{x: 527.5, y: 377},{x: 520.5, y: 373},{x: 514.5, y: 361},{x: 495.5, y: 362},{x: 495.5, y: 378},{x: 482.5, y: 371},{x: 475.5, y: 374},{x: 475.5, y: 383},{x: 441.5, y: 385},{x: 441.5, y: 472},{x: 345.5, y: 484},{x: 344.5, y: 457},{x: 334.5, y: 447}
                    ],
                    holeMap : [
                    ]
                },{
                    groupId : 3,                    
                    areaMap : [
                        {x: 39.5, y: 0},{x: 252.5, y: 69},{x: 333.5, y: 35},{x: 331.5, y: 403},{x: 253.5, y: 398},{x: 101.5, y: 402},{x: 101.5, y: 386},{x: 85.5, y: 385},{x: 86.5, y: 343},{x: 73.5, y: 344},{x: 78.5, y: 316},{x: 92.5, y: 308},{x: 104.5, y: 308},{x: 95.5, y: 287},{x: 63.5, y: 282},{x: 33.5, y: 286},{x: 29.5, y: 293},{x: 44.5, y: 310},{x: 55.5, y: 310},{x: 57.5, y: 347},{x: 51.5, y: 356},{x: 50.5, y: 384},{x: 0.5, y: 385},{x:0,y:0}
                    ],
                    holeMap : [
                        [{x: 268.5, y: 81},{x: 318.5, y: 65},{x: 318.5, y: 399},{x: 269.5, y: 398}]
                    ]
                }
            ]
        },
        {
            url:'images/int/bg4.jpg', 
            maps:[
                {   
                    groupId : 1,
                    areaMap : [
                        {x: 92.5, y: 0},{x: 292.5, y: 156},{x: 740.5, y: 162},{x: 753.5, y: 154},{x: 811.5, y: 156},{x: 810.5, y: 162},{x: 1004.5, y: 166},{x: 1123.5, y: 129},{x:1123.5, y:0}
                    ],
                    holeMap : [
                        [{x: 905.5, y: 145},{x: 913.5, y: 158},{x: 927.5, y: 160},{x: 1061.5, y: 113},{x: 1077.5, y: 96},{x: 1037.5, y: 91},{x: 906.5, y: 144}]
                    ]
                },{   
                    groupId : 2,
                    areaMap : [
                        {x: 92.5, y: 0},{x: 292.5, y: 156},{x: 293.5, y: 474},{x: 17.5, y: 699},{x: 1.5, y: 699},{x:0,y:0}
                    ],
                    holeMap : [
                        [{x: 291.5, y: 400},{x: 290.5, y: 289},{x: 285.5, y: 208},{x: 169.5, y: 150},{x: 151.5, y: 151},{x: 144.5, y: 282},{x: 146.5, y: 338},{x: 141.5, y: 382},{x: 144.5, y: 441},{x: 167.5, y: 446},{x: 193.5, y: 443},{x: 193.5, y: 429},{x: 268.5, y: 400}]
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 292.5, y: 156},{x: 740.5, y: 162},{x: 741.5, y: 256},{x: 723.5, y: 259},{x: 725.5, y: 270},{x: 826.5, y: 272},{x: 827.5, y: 362},{x: 813.5, y: 362},{x: 813.5, y: 354},{x: 801.5, y: 354},{x: 801.5, y: 347},{x: 758.5, y: 345},{x: 757.5, y: 334},{x: 714.5, y: 338},{x: 714.5, y: 346},{x: 725.5, y: 352},{x: 724.5, y: 372},{x: 684.5, y: 374},{x: 683.5, y: 464},{x: 651.5, y: 465},{x: 658, y: 432},{x: 666.5, y: 389},{x: 661.5, y: 356},{x: 667.5, y: 326},{x: 663.5, y: 318},{x: 673.5, y: 200},{x: 399.5, y: 200},{x: 403.5, y: 211},{x: 412.5, y: 334},{x: 408.5, y: 394},{x: 429.5, y: 392},{x: 439.5, y: 431},{x: 446.5, y: 469},{x: 293, y: 474}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 811.5, y: 161},{x: 1005.5, y: 166},{x: 1011.5, y: 407},{x: 913.5, y: 389},{x: 913.5, y: 232},{x: 831.5, y: 233},{x: 827.5, y: 252},{x: 809.5, y: 250},{x: 809.5, y: 200},{x: 827, y: 185},{x: 809.5, y: 183}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 433.5, y: 368},{x: 524.5, y: 368},{x: 519.5, y: 386},{x: 528.5, y: 391},{x: 528.5, y: 400},{x: 518.5, y: 399},{x: 493.5, y: 401},{x: 489.5, y: 404},{x: 476.5, y: 402},{x: 468.5, y: 434},{x: 468.5, y: 451},{x: 458.5, y: 455},{x: 456.5, y: 434},{x: 437.5, y: 378}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 563.5, y: 368},{x: 644.5, y: 368},{x: 634.5, y: 399},{x: 626.5, y: 423},{x: 606.5, y: 403},{x: 575.5, y: 403},{x: 572.5, y: 378}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 526.5, y: 454},{x: 555.5, y: 453},{x: 556.5, y: 468},{x: 530.5, y: 469}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 4,
                    areaMap : [
                        {x: 1004.5, y: 166},{x: 1123.5, y: 129},{x: 1128.5, y: 504},{x: 1127.5, y: 502},{x: 1030.5, y: 473},{x: 1029.5, y: 422},{x: 1034.5, y: 422},{x: 1034.5, y: 411},{x: 1011.5, y: 407}
                    ],
                    holeMap : [
                    ]
                }
            ]
        },
        {
            url:'images/ext/bg1.jpg', 
            maps:[
                {   
                    groupId : 1,
                    areaMap : [
                        {x: 1131, y: 333},{x: 475, y: 236},{x: 475, y: 227},{x: 475, y: 221},{x: 1132, y: 321}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 2,
                    areaMap : [
                        {x: 549.5, y: 257},{x: 461.5, y: 291},{x: 54.5, y: 296},{x: 193.5, y: 256}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 2,
                    areaMap : [
                        {x: 658, y: 266},{x: 658, y: 302},{x: 527, y: 303}//,{x: 525, y: 285},{x: 550, y: 280},{x: 549, y: 273},{x: 555, y: 270},{x: 540, y: 255},{x: 514, y: 257},{x: 513, y: 243}
                    ],
                    holeMap : [
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 833.5, y: 309},{x: 831.5, y: 474},{x: 1063, y: 473},{x: 1061.5, y: 308}
                    ],
                    holeMap : [
                        [{x: 848.5, y: 308},{x: 848.5, y: 461},{x: 939.5, y: 466},{x: 949.5, y: 456},{x: 964.5, y: 466},{x: 1048.5, y: 463},{x: 1049.5, y: 308}]
                    ]
                },{   
                    groupId : 3,
                    areaMap : [
                        {x: 864.5, y: 344},{x: 864.5, y: 460},{x: 1028.5, y: 460},{x: 1032.5, y: 342}
                    ],
                    holeMap : [
                    ]
                }
            ]
        }
    ];

    $scope.currentBackground = $scope.presetBgArr[4];
    $scope.active = 0;
    
    $scope.initColors = function(){
        $scope.models = {
            selected: null
        };

        $scope.colors = [
            {name:"Red", code:"BGP0922", bg:"#ff0000", jsColor:0xff0000, fontColor:"#000"},
            {name:"Blue", code:"BGP0921", bg:"#0000ff", jsColor:0x0000ff, fontColor:"#000"},
            {name:"Green", code:"BGP0920", bg:"#00ff00", jsColor:0x00ff00, fontColor:"#000"}
        ];

        $scope.palettes = {
            darkPalettes : [
                { name: "Red", colors: [] },
                { name: "Green", colors: [] },
                { name: "Aqua", colors: [] },
                { name: "Blue", colors: [] },
                { name: "Violet", colors: [] },
                { name: "Maroon", colors: [] }
            ],
            lightPalettes : [
                { name: "Red", colors: [] },
                { name: "Green", colors: [] },
                { name: "Aqua", colors: [] },
                { name: "Blue", colors: [] },
                { name: "Violet", colors: [] },
                { name: "Maroon", colors: [] }
            ],
            greyScalePalette : [],
            companyPalettes : [
                { name: "Gloss", colors:[], subtitle:"" },
                { name: "Emulsion", colors:[], subtitle:"Clinstay, Luxol and Super Star" },
                { name: "Texture", colors:[], subtitle:"" }
            ]
        };

        $scope.allColors = [];
        var colorBoxes = 6
        ,h = 0
        ,s = 100
        ,l = 50
        ,newhue = 0
        ;        

        for(var i = 0; i < $scope.palettes.darkPalettes.length; i++){
            var tempEl = $scope.palettes.darkPalettes[i];
            for(var j = 1; j <= colorBoxes - 1; j++){        
                h = newhue;
                l-= 7;
                for(var k = 1; k <= colorBoxes; k++){
                    h+= 10;       
                    var tpColor = "hsl("+h+","+s+"%,"+l+"%)"
                    ,jsColor = hsl2rgb(h,s,l)
                    ,tempObj = {type:"dark", name:"Dark Color", code:"D"+i+j+k, bg:tpColor, x:j, y:k, fontColor:j>2?"#fff":"#000", jsColor:jsColor}
                    ;
                    
                    tempEl.colors.push(tempObj);
                    $scope.allColors.push(tempObj);
                }
            }
            newhue+=60;
            l = 50;
        }

        l = 85
        ,newhue = 0
        ;

        for(var i = 0; i < $scope.palettes.lightPalettes.length; i++){
            var tempEl = $scope.palettes.lightPalettes[i];
            for(var j = 1; j <= colorBoxes - 1; j++){        
                h = newhue;
                l-= 7;
                for(var k = 1; k <= colorBoxes; k++){
                    h+= 10;       
                    var tpColor = "hsl("+h+","+s+"%,"+l+"%)"
                    ,jsColor = hsl2rgb(h,s,l)
                    ,tempObj = {type:"light", name:"Light Color", code:"L"+i+j+k, bg:tpColor, x:j, y:k, fontColor:j>3?"#fff":"#000", jsColor:jsColor}
                    ;
                    tempEl.colors.push(tempObj);
                    $scope.allColors.push(tempObj);
                }
            }
            newhue+=60;
            l = 85;
        }

        h = 360, s = 0, l = 0; 
        for(var i = 0; i < 51; i++){
            var tpColor = "hsl("+h+","+s+"%,"+l+"%)"
            ,jsColor = hsl2rgb(h,s,l)
            ,tempObj = {type:"greyscale", name:"Grey Color", code:"G"+i, x:i, y:0, bg:tpColor, fontColor:i<10?"#fff":"#000", jsColor:jsColor}
            ;
            $scope.palettes.greyScalePalette.push(tempObj)        
            $scope.allColors.push(tempObj);
            l+=2;
        }        

        $http.get('colors.json').success(function(data) {
        //            console.log(data.companycolors)
            for(var i = 0; i < data.companycolors.length; i++){
                var tempArr = data.companycolors[i]
                ,colorArr = $filter('filter')($scope.palettes.companyPalettes, {name:tempArr.name})[0].colors
                ,k = 0
                ;
                for(var j = 0; j < tempArr.colors.length; j++){
                    var tempEl = tempArr.colors[j]
                    ,tpColor = "rgb("+tempEl.rgbColor.r+","+tempEl.rgbColor.g+","+tempEl.rgbColor.b+")"
                    ,jsColor = rgbToHex(tempEl.rgbColor.r, tempEl.rgbColor.g, tempEl.rgbColor.b)
                    ,tempObj = {type:"company", name:tempEl.name, code:tempEl.code, x:j%6+1, y:k, bg:tpColor, fontColor:"#000", jsColor:jsColor}
                    ; 
                    colorArr.push(tempObj);
                    $scope.allColors.push(tempObj);
                    if((j+1)%6==0){
                        k++;
                    }
                }
            }
        });

        $scope.list = $scope.colors;
        $scope.models.selected =  $scope.colors[0];
        $scope.fillColor = $scope.list[0].jsColor;
    }

    $scope.initPixi = function(){
        graphicsArr = [];
        var bgEl = $scope.currentBackground;
        var container = $(".start-paint");
        app = new PIXI.Application(container.width(), container.height(), {antialias:true, transparent:true});         
        app.view.style.zIndex = 2;       
        container.append(app.view);   

        bgApp = new PIXI.Application(container.width(), container.height(), {antialias:true, transparent:true});  
        container.append(bgApp.view);   

        var container2 = $(".alter-canvas");
        app2 = new PIXI.Application(container2.width(), container2.height(), {antialias:true, backgroundColor:0xffffff});         
        container2.append(app2.view); 

        var container3 = $(".upload-scene");
        app3 = new PIXI.Application(container3.width(), container3.height(), {antialias:true, transparent:true});         
        container3.append(app3.view);   

        var container4 = $(".match-colors");
        app4 = new PIXI.Application(container4.width(), container4.height(), {antialias:true, transparent:true});         
        container4.append(app4.view);   

        app5 = new PIXI.Application(container3.width(), container3.height(), {antialias:true});         
        container3.append(app5.view);   

        $scope.drawBackground();
        $scope.drawPolygons($scope.currentBackground.maps, {lineOpts:{thickness:2, color: "0x27f1cb", opacity:0}, bgOpts:{color: "0x0fffab", opacity:0}});

        // start animating
        animate();
    }

    $scope.drawBackground = function(){
        clearStage(bgApp);
        clearStage(app);
        var bgEl = $scope.currentBackground
        ,pic = PIXI.Sprite.fromImage(bgEl.url)
        ;
        pic.anchor.set(0.5);
        pic.width = app.renderer.width;
        pic.height = app.renderer.height;
        pic.x = app.renderer.width / 2;
        pic.y = app.renderer.height / 2;
        pic.interactive = true;
        pic.mousedown = function(mouseData){     
            console.log(mouseData.data.global)
        }
        bgApp.stage.addChild(pic);
    }

    $scope.drawPolygons = function(maps, options){
        for(var i = 0; i < maps.length; i++){           
            var hitAreaArr = []
            ,currMap = maps[i].areaMap
            ,holeArr = maps[i].holeMap
            ;

            graphics = new PIXI.Graphics();
            graphics
            .lineStyle(options.lineOpts.thickness, options.lineOpts.color, options.lineOpts.opacity)
            .beginFill(options.bgOpts.color, options.bgOpts.opacity)
            .moveTo(currMap[0].x, currMap[0].y);

            hitAreaArr.push(new PIXI.Point(currMap[0].x, currMap[0].y));

            for(var j = 1; j < currMap.length; j++){
                graphics.lineTo(currMap[j].x, currMap[j].y);  
                hitAreaArr.push(new PIXI.Point(currMap[j].x, currMap[j].y));   
            }

            graphics
            .lineTo(currMap[0].x, currMap[0].y)
            .closePath();

            app.stage.addChild(graphics);

            //graphics.alpha = 0;
            graphics.interactive = true;
            graphics.buttonMode = true;
            graphics.hitArea = new PIXI.Polygon(hitAreaArr);
            graphics.groupId = maps[i].groupId;

            graphicsArr.push(graphics);

            if(holeArr.length > 0){
                for(var k = 0; k < holeArr.length; k++){
                    currHoles = holeArr[k];
                    var tempGraphics = new GraphicsNoBlending();
                    tempGraphics.lineStyle(options.lineOpts.thickness, options.lineOpts.color, options.lineOpts.opacity);
                    tempGraphics.beginFill(0,0);
                    tempGraphics.moveTo(currHoles[0].x, currHoles[0].y);

                    // Holes 
                    for(var j = 1; j < currHoles.length; j++){
                        tempGraphics.lineTo(currHoles[j].x, currHoles[j].y);  
                    }
                    tempGraphics
                    .lineTo(currHoles[0].x, currHoles[0].y)
                    .endFill()
                    ;
                    tempGraphics.groupId = maps[i].groupId;
                    app.stage.addChild(tempGraphics);
                }
            }
            $scope.attachHandlers();
        }
    }

    $scope.attachHandlers = function(){
        graphicsArr.forEach(function(obj){
            obj.mouseover = function(mouseData){
                //this.alpha = 1;
                var tempGr = $filter('filter')(app.stage.children, {groupId:this.groupId});
                //console.log(tempGr[0])
                for(var i = 0; i < tempGr.length; i++){
                    updateGraphicProps(tempGr[i], {lineAlpha:1});
                    //tempGr[i].lineAlpha = 0.1;
                }
            };
            obj.mouseout = function(mouseData){
                //this.alpha = 0.3;
                var tempGr = $filter('filter')(app.stage.children, {groupId:this.groupId});
                for(var i = 0; i < tempGr.length; i++){
                    updateGraphicProps(tempGr[i], {lineAlpha:0});
                    //tempGr[i].alpha = 0;
                }
            };
            obj.mousedown = function(mouseData){  
                console.log(mouseData.data.global)                
                var tempGr = $filter('filter')(graphicsArr, {groupId:this.groupId});
                for(var i = 0; i < tempGr.length; i++){
                    tempGr[i].clear();
                    graphicsArr.splice(graphicsArr.indexOf(tempGr[i]), 1);
                    app.stage.removeChild(tempGr[i]);
                }
                tempGr = $filter('filter')($scope.currentBackground.maps, {groupId:this.groupId});
                $scope.drawPolygons(tempGr, {lineOpts:{thickness:1, color: "0x27f1cb", opacity:1}, bgOpts:{color: $scope.fillColor, opacity:0.8}});

                var childArr = app.stage.children, tempColor;
                for(var i = 0; i < $scope.list.length; i++){
                    tempColor = $scope.list[i];
                    if($filter('filter')(childArr, {fillColor:tempColor.jsColor}).length > 0){
                        tempColor.inScene = true;
                    }else{
                        tempColor.inScene = false;
                    }
                }
                //console.log($scope.list)
            };
        })
    }

    $scope.selectColor = function($event, e){
        if($scope.list.indexOf(e) == -1){
            $scope.list.push(e);          
        }
        $scope.models.selected = e;          
        $scope.fillColor = e.jsColor;   
        /*$scope.reset();
        $scope.pageOptions.startPaint = true;     */
    }

    $scope.deleteItem = function($event, e){
        $scope.list.splice($scope.list.indexOf(e), 1);
        $scope.fillColor = $scope.list[0].jsColor;
        $scope.models.selected = $scope.list[0];
    }

    $scope.choosePaintScene = function(e){
        //console.log(e);
        $scope.currentBackground = e;
        $scope.drawBackground();
        $scope.drawPolygons($scope.currentBackground.maps, {lineOpts:{thickness:1, color: "0x27f1cb", opacity:0}, bgOpts:{color: "0x0fffab", opacity:0}});
        $scope.reset();
        $scope.pageOptions.startPaint = true;
    }

    $scope.chooseColor = function($event, e){
        clickedEl = $event.currentTarget;

        TweenMax.to([$(".color-big-sq, .grey-scale"), $(".color-sm-sq").not(clickedEl)], 0.1, {
            scale:1,
            zIndex:0,
            /*x:0,
            y:0,
            z:0,
            opacity:1,
            borderRadius:0*/
        });
        TweenMax.to($(".color-info"), 0.1, {
            opacity:0,
            visibility:"hidden"
        });
        fLevel = [], sLevel = [];        

        var arrToCheck
        ,tempEl
        ,el = $(clickedEl).parent().children("div")
        ,posArr = []
        ;

        if(e.type == 'dark'){
            arrToCheck = $scope.palettes.darkPalettes;
            posArr = [
                {x:e.x+1, y:e.y-1, level: 0}, //Bottom Left El
                {x:e.x+1, y:e.y, level:1}, //Bottom El
                {x:e.x+1, y:e.y+1, level: 0}, //Bottom Right El
                {x:e.x, y:e.y+1, level:1}, //Right El
                {x:e.x-1, y:e.y+1, level: 0}, //Top Right El
                {x:e.x-1, y:e.y, level:1}, //Top El
                {x:e.x-1, y:e.y-1, level: 0}, //Top Left El
                {x:e.x, y:e.y-1, level:1}, //Left El
            ];
        }else if(e.type == 'light'){
            arrToCheck = $scope.palettes.lightPalettes;
            posArr = [
                {x:e.x+1, y:e.y-1, level: 0}, //Bottom Left El
                {x:e.x+1, y:e.y, level:1}, //Bottom El
                {x:e.x+1, y:e.y+1, level: 0}, //Bottom Right El
                {x:e.x, y:e.y+1, level:1}, //Right El
                {x:e.x-1, y:e.y+1, level: 0}, //Top Right El
                {x:e.x-1, y:e.y, level:1}, //Top El
                {x:e.x-1, y:e.y-1, level: 0}, //Top Left El
                {x:e.x, y:e.y-1, level:1}, //Left El
            ];
        }else if(e.type == 'greyscale'){
            arrToCheck = $scope.palettes.greyScalePalette;
            posArr = [
                {x:e.x+1, y:e.y, level:1}, //Right El
                {x:e.x+2, y:e.y, level:0}, //2nd Right El
                {x:e.x-1, y:e.y, level:1}, //Left El
                {x:e.x-2, y:e.y, level:0}, //2nd Left El
            ];
        }else if(e.type == 'matched'){
            arrToCheck = $scope.matchedColors;
            posArr = [
                {x:e.x+1, y:e.y, level:1}, //Right El
                {x:e.x+2, y:e.y, level:0}, //2nd Right El
                {x:e.x-1, y:e.y, level:1}, //Left El
                {x:e.x-2, y:e.y, level:0}, //2nd Left El
            ];
        }else{
            arrToCheck = $scope.palettes.companyPalettes;
            posArr = [
                {x:e.x+1, y:e.y-1, level: 0}, //Bottom Left El
                {x:e.x+1, y:e.y, level:1}, //Bottom El
                {x:e.x+1, y:e.y+1, level: 0}, //Bottom Right El
                {x:e.x, y:e.y+1, level:1}, //Right El
                {x:e.x-1, y:e.y+1, level: 0}, //Top Right El
                {x:e.x-1, y:e.y, level:1}, //Top El
                {x:e.x-1, y:e.y-1, level: 0}, //Top Left El
                {x:e.x, y:e.y-1, level:1}, //Left El
            ];
        }

        for(var i = 0; i < posArr.length; i++){
            tempEl = getInArray(el, arrToCheck, posArr[i], e.type);
            if(tempEl){
                if(posArr[i].level == 0){
                    fLevel.push(tempEl);
                }else{
                    sLevel.push(tempEl);
                }
            }            
        }
        var elFocusTl = new TimelineMax();
        elFocusTl
        .add("enter1")
        .to($(clickedEl).parent(), 0.05, {
            zIndex:1
        }, "enter1")
        .to(clickedEl, 1, {
            scale:3.5,
            borderRadius:2,
            zIndex:3,
            transformPerspective:2000,
            ease:Back.easeOut
        }, "enter1")       
        .to($(clickedEl).find(".color-info"), 0.05, {
            visibility:"visible"
        }, "enter1")
        .to($(clickedEl).find(".color-info"), 1, {          
            opacity:1
        }, "enter1+=0.1")
        .add("enter2", "enter1+=0.1")
        .to(sLevel, 1, {
            scale:2.5,
            zIndex:2,
            ease:Back.easeOut,
            transformPerspective:2000
        }, "enter2") 
        .add("enter3", "enter2+=0.1")
        .to(fLevel, 1, {
            scale:2,
            zIndex:1,
            ease:Back.easeOut,
            transformPerspective:2000
        }, "enter3")
        ;
        
    }

    $scope.resetpos = function(){
        TweenMax.to($(".color-big-sq, .color-sm-sq, .grey-scale"), 1, {
            scale:1,
            x:0,
            y:0,
            z:0,
            zIndex:0,
            opacity:1,
            borderRadius:0
        });
        TweenMax.to($(".color-info"), 1, {
            opacity:0,
            visibility:"hidden"
        });
    }

    $scope.saveImage = function(){        
        //console.log(data)
        clearStage(app2);

        var head = PIXI.Sprite.fromImage("images/header.png")
        ,foot = PIXI.Sprite.fromImage("images/footer.png")
        //,smallImg = PIXI.Sprite.fromImage($scope.currentBackground.url)
        ;
        head.anchor.set(0.5);
        head.x = app2.renderer.width / 2;
        head.y = 50;
        head.width = app2.renderer.width;
        head.height = 80;
        app2.stage.addChild(head);
       
        if($scope.pageOptions.sceneOption == 'startPaint'){
            bgApp.renderer.render(bgApp.stage);
            var data = bgApp.renderer.view.toDataURL("image/png", 1)
            ,img = new Image()
            ;
            img.src = data;
            var baseTexture = new PIXI.BaseTexture(img)
            ,texture = new PIXI.Texture(baseTexture)
            ,bgImg = new PIXI.Sprite(texture)
            ,smallImg = new PIXI.Sprite(texture)
            ;

            bgImg.anchor.set(0.5);
            bgImg.x = app2.renderer.width / 2;
            bgImg.y = 300;
            bgImg.width = app2.renderer.width;
            bgImg.height = 400;
            app2.stage.addChild(bgImg);

            app.renderer.render(app.stage);
            var data = app.renderer.view.toDataURL("image/png", 1)
            ,img = new Image()
            ;
            img.src = data;

            baseTexture = new PIXI.BaseTexture(img)
            ,texture = new PIXI.Texture(baseTexture)
            ,mainImg = new PIXI.Sprite(texture)
            ;

            mainImg.anchor.set(0.5);
            mainImg.x = app2.renderer.width / 2;
            mainImg.y = 300;
            mainImg.width = app2.renderer.width;
            mainImg.height = 400;
            app2.stage.addChild(mainImg);
         
            smallImg.anchor.set(0.5);
            smallImg.height = 120;
            smallImg.width = 200;
            smallImg.x = app2.renderer.width - 100;
            smallImg.y = 440;
            app2.stage.addChild(smallImg);
        }else if($scope.pageOptions.sceneOption == 'paintScene'){
            app5.renderer.render(app5.stage);
            var data = app5.renderer.view.toDataURL("image/png", 1)
            ,img = new Image()
            ;
            img.src = data;
            var baseTexture = new PIXI.BaseTexture(img)
            ,texture = new PIXI.Texture(baseTexture)
            ,bgImg = new PIXI.Sprite(texture)
            ,smallImg = new PIXI.Sprite(texture)
            ;

            bgImg.anchor.set(0.5);
            bgImg.x = app2.renderer.width / 2;
            bgImg.y = 300;
            bgImg.width = app2.renderer.width;
            bgImg.height = 400;
            app2.stage.addChild(bgImg);

            app3.renderer.render(app3.stage);
            var data = app3.renderer.view.toDataURL("image/png", 1)
            ,img = new Image()
            ;
            img.src = data;

            baseTexture = new PIXI.BaseTexture(img)
            ,texture = new PIXI.Texture(baseTexture)
            ,mainImg = new PIXI.Sprite(texture)
            ;

            mainImg.anchor.set(0.5);
            mainImg.x = app2.renderer.width / 2;
            mainImg.y = 300;
            mainImg.width = app2.renderer.width;
            mainImg.height = 400;
            app2.stage.addChild(mainImg);
         
            smallImg.anchor.set(0.5);
            smallImg.height = 120;
            smallImg.width = 200;
            smallImg.x = app2.renderer.width - 100;
            smallImg.y = 440;
            app2.stage.addChild(smallImg);
        }else{
            return;
        }        

        var tempColor, tempGraphic, xOff = 0, yOff = 500, tempHeight = 100, k = 0;
        for(; k < $scope.list.length; k++){
            tempColor = $scope.list[k];            
            tempGraphic = new PIXI.Graphics()
            tempGraphic
            .lineStyle(1, tempColor.jsColor, 1)
            .beginFill(tempColor.jsColor, 1)                
            .drawRoundedRect(xOff, yOff, app2.renderer.width/2, tempHeight, 10)
            .endFill()
            ;

            app2.stage.addChild(tempGraphic)
            
            var style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 700,
                fill: 0x000000
            })
            ,text1 = new PIXI.Text("Code: " + typeof tempColor.code === "undefined"?"":tempColor.code, style)
            ,text2 = new PIXI.Text("Name: " + typeof tempColor.name === "undefined"?"":tempColor.name, style)
            ;
            text1.anchor.set(0);
            text2.anchor.set(0);

            text1.x = text2.x = xOff+10;
            text1.y = yOff+40;
            text2.y = yOff+60;
            app2.stage.addChild(text1);
            app2.stage.addChild(text2);

            if(tempColor.inScene){
                var text3 = new PIXI.Text("# Featured in Scene", style)
                text3.anchor.set(0);
                text3.x = xOff + 10;
                text3.y = yOff + 10;
                app2.stage.addChild(text3);
            }

            if(k%2 == 0){
                xOff = app2.renderer.width/2;
            }else{
                xOff = 0;
                yOff+= tempHeight;
            }
        }
        if(k%2 == 0){
            yOff-= tempHeight;
        }
        yOff += 140;
        foot.anchor.set(0.5);
        foot.x = app2.renderer.width / 2;
        foot.y = yOff;
        foot.width = app2.renderer.width;
        foot.height = 80;
        app2.stage.addChild(foot);

        var mainImgOutline = new PIXI.Graphics();
        mainImgOutline
        .lineStyle(5, 0xffffff, 1)
        .drawRect(0, 100, mainImg.width, mainImg.height)
        ;
        app2.stage.addChild(mainImgOutline);

        var smallImgOutline = new PIXI.Graphics();
        smallImgOutline
        .lineStyle(5, 0xffffff, 1)
        .drawRect(app2.renderer.width - 200, 380, smallImg.width, smallImg.height)
        ;
        app2.stage.addChild(smallImgOutline);
        
        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 100,
            fill: 0xffffff
        })
        ,text = new PIXI.Text('Original', style)
        ;
        
        text.anchor.set(0);
        text.x = app2.renderer.width - 60;
        text.y = 385;
        app2.stage.addChild(text);      
        yOff += 50;

        setTimeout(function(){
            app2.renderer.render(app2.stage);
            data = extractRegion(app2.renderer, 0, 0, app2.renderer.width, yOff);
            downloadURI(data, "Berger Paints Scene created with Paint Visualizer.png");
            //window.open(data, "_blank");
        }, 1000);      
    }

    $scope.erasePaintScene = function(){
        clearStage(app3);
        app3.stage.addChild($scope.currSprite);        
    }

    $scope.initPaintScene = function(){
        var pointArr = []
        ,paintPointArr = []
        ,erasePointArr = []
        ,pointGrArr = []
        ,polyGonArr = []
        ,coords
        ,graphics
        ,point
        ,sprite = new PIXI.Graphics()
        ,lastPos = null
        ,zoomActive = false
        ;

        sprite.lineStyle(1, 0x000000, 0);
        sprite.drawRect(0,0,app3.renderer.width,app3.renderer.height);

       // sprite.anchor.set(0.5);
        sprite.x = 0;
        sprite.y = 0;
        sprite.buttonMode = true;
        sprite.interactive = true;
        sprite.hitArea = new PIXI.Rectangle(0, 0, app3.renderer.width, app3.renderer.height);
        $scope.currSprite = sprite;
        var paint = false, erase = false;
        
        sprite.mousedown = function(mouseData){          
            coords = mouseData.data.global;
            switch($scope.pageOptions.activePaintScTab){
                case 'Add Area' :
                    if(pointArr.length > 0){
                        graphics.moveTo(pointArr[pointArr.length - 1].x, pointArr[pointArr.length - 1].y)
                        graphics.lineTo(coords.x, coords.y);
                        app3.stage.addChild(graphics);
                    }
                    
                    point = new PIXI.Graphics();
                    point.lineStyle(2, 0xffffff, 1);
                    point.drawCircle(coords.x, coords.y, 10);
                    app3.stage.addChild(point);
                    pointGrArr.push(point);

                    if(pointArr.length == 0){
                        graphics = new GraphicsNoBlending();
                        graphics.lineStyle(2, 0xffffff, 1);
                        
                        point.interactive = true;
                        point.buttonMode = true;
                        point.hitArea = new PIXI.Circle(coords.x, coords.y, 10);
                        point.mouseover = function(){
                            this.tint = 0x00ff00;
                        };
                        point.mouseout = function(){
                            this.tint = 0xffffff;
                        };
                        point.mousedown = function(){
                            this.tint = 0xffffff;
                            console.log("Loop Closed!");
                            graphics.moveTo(pointArr[pointArr.length - 1].x, pointArr[pointArr.length - 1].y)
                            graphics.lineTo(pointArr[0].x, pointArr[0].y);
                            for(var i = 0; i < pointGrArr.length; i++){
                                app3.stage.removeChild(pointGrArr[i]);
                            }
                            for(var i = 0; i < pointArr.length; i++){
                                polyGonArr.push(pointArr[i].x, pointArr[i].y);
                            }
                            
                            graphics.clear();
                            app3.stage.removeChild(graphics);

                            graphics.lineStyle(0, 0xffffff, 0);
                            graphics.beginFill($scope.fillColor, 0.8);
                            graphics.drawPolygon(polyGonArr);
                            graphics.endFill();                            
                            app3.stage.addChild(graphics);

                            pointGrArr = [];
                            polyGonArr = [];
                            pointArr = [];
                        };
                    }
                    pointArr.push({x:coords.x, y:coords.y});
                break;
                case 'Remove Area' :
                    if(pointArr.length > 0){
                        graphics.moveTo(pointArr[pointArr.length - 1].x, pointArr[pointArr.length - 1].y)
                        graphics.lineTo(coords.x, coords.y);
                        app3.stage.addChild(graphics);
                    }
                    
                    point = new PIXI.Graphics();
                    point.lineStyle(2, 0xffffff, 1);
                    point.drawCircle(coords.x, coords.y, 10);
                    app3.stage.addChild(point);
                    pointGrArr.push(point);

                    if(pointArr.length == 0){
                        graphics = new GraphicsNoBlending();
                        graphics.lineStyle(2, 0xffffff, 1);

                        point.interactive = true;
                        point.buttonMode = true;
                        point.hitArea = new PIXI.Circle(coords.x, coords.y, 10);
                        point.mouseover = function(){
                            this.tint = 0x00ff00;
                        };
                        point.mouseout = function(){
                            this.tint = 0xffffff;
                        };
                        point.mousedown = function(){
                            this.tint = 0xffffff;
                            console.log("Loop Closed!");
                            graphics.moveTo(pointArr[pointArr.length - 1].x, pointArr[pointArr.length - 1].y)
                            graphics.lineTo(pointArr[0].x, pointArr[0].y);
                            for(var i = 0; i < pointGrArr.length; i++){
                                app3.stage.removeChild(pointGrArr[i]);
                            }
                            for(var i = 0; i < pointArr.length; i++){
                                polyGonArr.push(pointArr[i].x, pointArr[i].y);
                            }
                            
                            graphics.clear();
                            app3.stage.removeChild(graphics);

                            graphics.lineStyle(0, 0xffffff, 0);
                            graphics.beginFill($scope.fillColor, 0);
                            graphics.drawPolygon(polyGonArr);
                            graphics.endFill();                            
                            app3.stage.addChild(graphics);

                            pointGrArr = [];
                            polyGonArr = [];
                            pointArr = [];
                        };
                    }
                    pointArr.push({x:coords.x, y:coords.y});
                break;
                case 'Paint' :
                    graphics = new GraphicsNoBlending();
                    paint = true;
                    addPaintGraphic(graphics, paintPointArr, coords, 0.9);                                    
                break;
                case 'Erase Area' :
                    graphics = new GraphicsNoBlending();
                    erase = true;
                    addPaintGraphic(graphics, paintPointArr, coords, 0);                                    
                break;
                case 'Zoom In' :
                    zoomActive  = true;
                    lastPos = {x:coords.x, y:coords.y};
                    zoom(app3, coords, true);
                    zoom(app5, coords, true);
                break;
                case 'Zoom Out' :
                    zoomActive  = true;
                    lastPos = {x:coords.x, y:coords.y};
                    zoom(app3, coords, false);
                    zoom(app5, coords, false);
                break;
            }
        };
        
        sprite.mouseup = function(mouseData){
            paint = false
            ,erase = false
            ,zoomActive = false
            ,lastPos = null
            ,paintPointArr = []
            ,erasePointArr = []
            ;
        };

        sprite.mousemove = function(mouseData){
            coords = mouseData.data.global;
            if(paint){
                addPaintGraphic(graphics, paintPointArr, coords, 0.9);                                    
            }else if(erase){
                addPaintGraphic(graphics, paintPointArr, coords, 0);                                    
            }else if(zoomActive){
                app3.stage.x += (coords.x-lastPos.x);
                app5.stage.x += (coords.x-lastPos.x);
                app3.stage.y += (coords.y-lastPos.y);  
                app5.stage.y += (coords.y-lastPos.y);  
                lastPos = {x:coords.x,y:coords.y};
            }
            app3.stage.removeChild(cursorSprite);
            cursorSprite.x = coords.x - $scope.pageOptions.paintRadius/2;
            cursorSprite.y = coords.y - $scope.pageOptions.paintRadius/2;
            app3.stage.addChild(cursorSprite);            
        };

        app3.stage.addChild(sprite);
        $scope.resetPaintScTabs(); 
        $scope.pageOptions.showUploadScene = true;
    }

    $scope.changePaintCursor = function(options){
        $scope.pageOptions.paintBrush = options.paintBrush;
        $scope.pageOptions.paintRadius = options.paintRadius;
        $scope.pageOptions.paintBrushOpt = options.paintBrushOpt;
        $scope.currSprite.cursor = "none";

        cursorSprite.clear();
        app3.stage.removeChild(cursorSprite);

        cursorSprite.lineStyle(2, 0xffffff, 1);
        cursorSprite.beginFill(0xffffff, 0.5);
        switch(options.paintBrush){
            case 'line' :
                $scope.currSprite.cursor = "crosshair";
            break;
            case 'sq' : 
                cursorSprite.drawRect(0, 0, options.paintRadius, options.paintRadius);
            break;
            case 'circ' : 
                cursorSprite.drawCircle(0, 0, options.paintRadius);
            break;
        }
        cursorSprite.endFill();                
        app3.stage.addChild(cursorSprite);
    }

    $scope.uploadSceneForPaint = function(){
        if ($scope.fileForPaint && $scope.fileForPaint.files && $scope.fileForPaint.files[0]) {
            var reader = new FileReader()
            ,image = new Image()
            ;
            reader.onload = function (e) {  
                clearStage(app3);
                clearStage(app5);
                image.src = e.target.result;
                var baseTexture = new PIXI.BaseTexture(image)
                ,texture = new PIXI.Texture(baseTexture)
                ,bgImg = new PIXI.Sprite(texture)
                ;

                bgImg.anchor.set(0.5);
                bgImg.x = app5.renderer.width / 2;
                bgImg.y = app5.renderer.height / 2;
                bgImg.width = app5.renderer.width;
                bgImg.height = app5.renderer.height;
                app5.stage.addChild(bgImg);

                $($(".upload-scene canvas")[1]).css("z-index", 0);
                $scope.$apply(function(){
                    $scope.initPaintScene();
                });
            }
            reader.readAsDataURL($scope.fileForPaint.files[0]);
        }else{
            $scope.resetPaintScTabs(); 
            $scope.pageOptions.showUploadScene = true;
        }
    }

    $scope.uploadSceneForColors = function(){
        if ($scope.fileForColor && $scope.fileForColor.files && $scope.fileForColor.files[0]) {
            var reader = new FileReader()
            ,plus = PIXI.Sprite.fromImage("images/plus.png")
            ,image = new Image()
            ,tempMatch
            ,coords
            ,pixelData
            ;
            reader.onload = function (e) {
                clearStage(app4);

                image.src = e.target.result
                ,baseTexture = new PIXI.BaseTexture(image)
                ,texture = new PIXI.Texture(baseTexture)
                ,pic = new PIXI.Sprite(texture)
                ,graphics = new PIXI.Graphics()
                ;

                pic.anchor.set(0.5);
                pic.width = app4.renderer.width;
                pic.height = app4.renderer.height;
                pic.x = app4.renderer.width / 2;
                pic.y = app4.renderer.height / 2;
                pic.interactive = true;
                pic.buttonMode = true;
                pic.cursor = "crosshair";

                pic.mousedown = function(mouseData){     
                    coords = mouseData.data.global;
                    setTimeout(function(){
                        graphics.clear();
                        app4.stage.removeChild(graphics);
                        var ctx = app4.renderer.plugins.extract.canvas(app4.stage);
                        pixelData = ctx.getContext('2d').getImageData(coords.x, coords.y, 1, 1).data;
                        graphics
                        .lineStyle(2, 0xffffff, 1)
                        .beginFill(rgbToHex(pixelData[0], pixelData[1], pixelData[2]), 1)
                        .moveTo(0, -10)
                        .lineTo(100, -10)
                        .arcTo(110, -10, 110, 0, 10)
                        .lineTo(110, 50)
                        .arcTo(110, 60, 100, 60, 10)
                        .lineTo(10, 60)
                        .arcTo(0, 60, 0, 50, 10)
                        .closePath()
                        .drawCircle(0, 0, 10)
                        .endFill()
                        ;

                        graphics.interactive = true;
                        graphics.buttonMode = true;
                        graphics.x = coords.x;
                        graphics.y = coords.y;
                        graphics.mousedown = function(mouseData){
                            var tempColor = {};

                            tempColor.bg = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
                            tempColor.jsColor = this.graphicsData[0].fillColor;
                            tempColor.fontColor = "#000";
                            tempColor.type = "matched";
                            tempMatch = $filter('filter')($scope.allColors, {jsColor:tempColor.jsColor});

                            if(tempMatch.length > 0){
                                tempColor.name = tempMatch[0].name;
                                tempColor.code = tempMatch[0].code;
                            }else{
                                tempColor.name = "Matched Color";
                                tempColor.code = "MCL-007";
                            }
                            $scope.$apply(function(){
                                $scope.selectColor("event", tempColor);
                            });
                        }
                        app4.stage.addChild(graphics);

                        plus.anchor.set(0.5);
                        plus.x = graphics.x + 55;
                        plus.y = graphics.y + 25;
                        plus.width = plus.height = 30;
                        app4.stage.addChild(plus);

                    }, 500)
                }
                app4.stage.addChild(pic);

                var scope = $scope;
                angular.element(image).chameleon("getImageColors", {
                    onGetColorsSuccess : function (colors, $container, s) { 
                        scope.$apply(function(){
                            scope.resetExpColorTabs();
                            scope.pageOptions.showMatchColors = true;
                            scope.matchedColors = colors;
                            scope.drawMatchColors();
                        });
                    }
                });
            }
            reader.readAsDataURL($scope.fileForColor.files[0]);
        }else{
            $scope.resetExpColorTabs(); 
            $scope.pageOptions.showMatchColors = true;
        }
    }

    $scope.drawMatchColors = function(){
        var tempColor, tempMatch, jsColor;
        for(var i = 0; i < $scope.matchedColors.length; i++){
            tempColor = $scope.matchedColors[i]
            ,jsColor = "0x" + tempColor.hex
            ,tempMatch = $filter('filter')($scope.allColors, {jsColor:jsColor})
            ;
            if(tempMatch.length > 0){
                tempColor.name = tempMatch[0].name;
                tempColor.code = tempMatch[0].code;
            }else{
                tempColor.name = "Matched Color";
                tempColor.code = "MCL-007";
            }
            tempColor.bg = tempColor.rgb;
            tempColor.jsColor = jsColor;
            tempColor.fontColor = "#000";
            tempColor.x = i;
            tempColor.y = 0;
            tempColor.type = "matched";
        }
        //console.log($scope.matchedColors);
        //console.log($scope.allColors);
    }

    $scope.initColors();
    $scope.initPixi();  
    //$scope.saveImage();  
})
.directive('fileModel', function ($parse) {    
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0]);
                });
                scope.uploadSceneForPaint();                
            });
        }
    };
})
.directive('fileModel2', function ($parse) {    
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel2);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0]);
                });
                scope.uploadSceneForColors();                
            });
        }
    };
})
.directive("highlight", function() {
  return function(scope, element, attrs) {
    element.on('mouseup', function(event) {
        $(app3.renderer.view).css("visibility", "visible")
        element.removeClass(attrs.highlight)
    })
    element.on('mousedown', function(event) {
        $(app3.renderer.view).css("visibility", "hidden")
        element.addClass(attrs.highlight)
    })
  }
})
;