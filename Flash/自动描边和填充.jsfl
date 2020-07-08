/*
*家园守卫战2 字体自动生成（打散、描边、填充、添加阴影）
*auhtor : xiangjiabanana@126.com
*date   :2013-03-20
*/

//<-------相关参数设置BEGIN--------->
var strokeThickness = 2 ;
var strockColor = "#000000" ;
var TopPartColor = '#FFD718';
var BottomPartColor = '#F7B810';
var shadeOffSetX = (-0.5) * strokeThickness;
var shadeOffSetY = 0.5 * strokeThickness;
//<--------相关参数设置END---------->

breakApartText( fl.getDocumentDOM().selection[0] );

function autoStroke( cshape )
{
	
	if( cshape == null || "shape" != cshape.elementType ){    
		fl.trace('自动描边参数无效。');
        return ;
	}
	else{	
		fl.trace('开始描边。');	
		var path = fl.drawingLayer.newPath();
		var e,p0,p1,p2;
		var ed = cshape.edges; // << this is the key of optimization
		var i = ed.length;
		while(--i > -1)
		// for (var i=0, len=shape.edges.length; i < len; ++i)
		{
			path.newContour(); //lift the pen to avoid lines across the shape
			//for all edges
			e = ed[i];
			//get controll points
			p0 = e.getControl(0);
			p1 = e.getControl(1);
			p2 = e.getControl(2);

			if (e.isLine)
			{
				//straight line
				path.addPoint(p0.x,p0.y);
				path.addPoint(p2.x,p2.y);
			}
			else
			{
				//curve with one midle point
				path.addCurve(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
			}
		}		
		fl.getDocumentDOM().clipCut();
		path.makeShape(true,false); //draw the contour without fill	
		setStrokeStyle();
		var timeline =  fl.getDocumentDOM().getTimeline();

		if(timeline.currentLayer == 0)
		{
			timeline.addNewLayer("textFill", "normal", true);
		}else
		{
			timeline.currentLayer = timeline.currentLayer - 1 ;
		}		
		document.clipPaste(true);
		autoSelecteAndFill( fl.getDocumentDOM().selection[0] );

		document.selectNone();
		var tempCurrentLayer = timeline.currentLayer ;
		lockLayerExcept( timeline.currentLayer );//除了当前图层，锁定其它
		selectWholeRect( cshape );
		lockLayerExcept( -1 );//解锁
		timeline.currentLayer = tempCurrentLayer ;
		//timeline.setSelectedLayers(timeline.currentLayer);
		fl.getDocumentDOM().clipCopy();
		if(timeline.currentLayer == timeline.layerCount- 1 ) 
		{
			timeline.addNewLayer("textShade", "normal", false);
		}else{
			timeline.currentLayer = timeline.currentLayer + 1 ;
		}

		document.clipPaste(true);
		var shape = fl.getDocumentDOM().selection[0] ;
		shape.x += shadeOffSetX ;
		shape.y += shadeOffSetY ;
    }	
}
/*
*如果 layerIndex <= -2 ，锁定所有图层 ；
*如果 layerIndex = -1 ，解锁所有图层 ；
*否则，锁定除了layerIndex图层以外，其余图层
*/
function lockLayerExcept(layerIndex)
{
	var timeline = fl.getDocumentDOM().getTimeline();	
	if(layerIndex == -1){
		for(var i = 0 ; i < timeline.layerCount ; i++){
			timeline.currentLayer = i ;
			fl.getDocumentDOM().getTimeline().setLayerProperty('locked', false);
		}
	}else if(layerIndex >= 0){
		for(var i = 0 ; i < timeline.layerCount ; i++){
			timeline.currentLayer = i ;
			var boo = true ;
			if(layerIndex == i){
				boo = false ;
			}
			fl.getDocumentDOM().getTimeline().setLayerProperty('locked', boo);
		}
	}
	
}
/*
*将文字打散
*/
function breakApartText( cshape )
{
	if( cshape == null || "text" != cshape.elementType ){
		autoStroke( cshape );
        return ;
	}
	else{
		document.breakApart();
		breakApartText( fl.getDocumentDOM().selection[0] );
	}
}
/*
*设置描边线的样式
*/
function setStrokeStyle()
{
	var stroke =  document.getCustomStroke() ;
	stroke.color = strockColor;
	stroke.thickness = strokeThickness;
	document.setCustomStroke(stroke) ;
}
/*
*设置渐变填充
*/
function setFillWithGradient ( cshape )
{
	if( cshape == null || "shape" != cshape.elementType ){        
        return ;
	}	
	else{
		fl.getDocumentDOM().selection[0] = cshape ;
		 var fill = fl.getDocumentDOM().getCustomFill(); 		
		 fill.style = "linearGradient"; 
		 fill.colorArray = [ 0xf7b810,0xf7b810,0xffd718,0xffd718]; 
		 fill.posArray = [0,127,128,255]; 

		var mat = fl.getDocumentDOM().selection[0].matrix ;
		/*for( var i= 0 ; i < fl.getDocumentDOM().selection.length ; i++ ){
			mat = fl.Math.concatMatrix( mat , fl.getDocumentDOM().selection[i].matrix );
			for (str in fill.matrix){
				fl.trace(str+":"+fill.matrix[str]);
			}
		}*/
		 var jiaodu = caculateMatrixB(90);
		 mat.a = Math.cos(jiaodu) ;
		 mat.b = -1 * Math.sin(jiaodu) ;
		 mat.c = -1 * mat.b;
		 mat.d = mat.a ;
		 mat.tx = 0 ;
		 mat.ty = 0 ;
		 fill.matrix = mat ;	
		 fl.getDocumentDOM().setCustomFill(fill);
	}
}
/*
*自动选择上半部分，用TopPartColor填充，然后选择下半部分，用BottomPartColor填充
*/
function autoSelecteAndFill( cshape )
{
	if( cshape == null || "shape" != cshape.elementType ){        
        return ;
	}
	else{
		var shape ;
		shape =  selectTopHalfRect( cshape );
		setSolidFill(shape , TopPartColor );
		shape = selectBottomHalfRect ( cshape ) ;
		setSolidFill(shape , BottomPartColor );
	}
}
/*
*设置单色填充
*/
function setSolidFill(cshape , color)
{
	if( cshape == null || "shape" != cshape.elementType ){        
        return ;
	}
	else{
		var fill = fl.getDocumentDOM().getCustomFill();
		fill.style = 'solid';
		fill.color = color ;
		fl.getDocumentDOM().setCustomFill(fill);
	}
}
/*
*选择形状的上半部分
*/
function selectTopHalfRect(cshape)
{	
	//上半部分的选择区域
	var selectLeft = cshape.x - cshape.width * 0.5 - 5;
	var selectTop = cshape.y - cshape.height * 0.5 - 5;
	var selectRight = cshape.x + cshape.width * 0.5  + 5;
	var selectBottom = parseInt(cshape.y);
	fl.getDocumentDOM().setSelectionRect({left:selectLeft, top:selectTop, right:selectRight, bottom:selectBottom}, true, false);
	var shape = fl.getDocumentDOM().selection[0] ;
	var obj = {left:selectLeft, top:selectTop, right:selectRight, bottom:selectBottom} ;
	return shape ;
}

/*
*选择形状的下半部分
*/
function selectBottomHalfRect(cshape)
{
	//上半部分的选择区域
	var selectLeft = cshape.x - cshape.width * 0.5 - 5;
	var selectTop = parseInt(cshape.y );
	var selectRight = cshape.x + cshape.width * 0.5 + 5;
	var selectBottom = cshape.y + cshape.height * 0.5 + 5;
	fl.getDocumentDOM().setSelectionRect({left:selectLeft, top:selectTop, right:selectRight, bottom:selectBottom}, true, false);
	var shape = fl.getDocumentDOM().selection[0] ;
	var obj = {left:selectLeft, top:selectTop, right:selectRight, bottom:selectBottom} ;
	return shape ;
}

/*
*选择整个形状
*/
function selectWholeRect(cshape)
{
	//上半部分的选择区域
	var selectLeft = cshape.x - cshape.width * 0.5 - 5 - strokeThickness;
	var selectTop = cshape.y -  cshape.width * 0.5 - 5 - strokeThickness;
	var selectRight = cshape.x + cshape.width * 0.5 + 5 + strokeThickness;
	var selectBottom = cshape.y + cshape.height * 0.5 + 5 + strokeThickness;
	fl.getDocumentDOM().setSelectionRect({left:selectLeft, top:selectTop, right:selectRight, bottom:selectBottom}, true, false);
	var shape = fl.getDocumentDOM().selection[0] ;
	return shape ;
}

/*
*将角度转换为弧度
*/
function caculateMatrixB( jiaodu){
    return jiaodu * Math.PI/180;
}

