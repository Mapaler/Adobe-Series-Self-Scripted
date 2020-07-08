var dom = fl.getDocumentDOM(); 
var timeline =  dom.getTimeline(); //获取时间轴
var layerArray = timeline.layers; //获取层
var ln = timeline.layerCount; //获取层总数
var fillColor = 0xFFFFFF; //填充色
var backgroundColor = 0x0; //背景色
var layerColor = 0xFF0000; //图层线条色

var myDate = new Date();
msg(myDate.toLocaleTimeString());//显示时间

if(ln<2)
{
	var frameArray = layerArray[0].frames; //获取帧
	var fn = frameArray.length; //获取帧总数
	if (fn < 2)
	{
		msg('工程尚未导入图片',true);
	}else
	{
		//初始化舞台大小
		var element = frameArray[0].elements[0]; //获取帧
		fl.getDocumentDOM().width = parseInt(element.width);
		fl.getDocumentDOM().height = parseInt(element.height);
		msg('设置舞台大小完成');
		//所有帧的图片都移动到左上角
		for (j=0; j<fn; j++)
		{ 
			if (j==frameArray[j].startFrame)
			{
				var element = frameArray[j].elements[0]; //获取元素
				element.x = 0;
				element.y = 0;
			}
		}
		msg('图片序列匹配舞台完成');
		//初始化绘制准备工作
		layerArray[0].locked = true; //锁定初始层
		timeline.addNewLayer("ROI", "normal", true); //新建ROI层
		var layerArray = timeline.layers; //重新获取层
		layerArray[0].color = layerColor; //ROI层颜色
		layerArray[0].outline = true; //ROI只显示边框
		layerArray[0].frames[0].tweenType = "shape"; //创建补间形状
		layerArray[0].layerType = "mask"; //变为遮罩层
		layerArray[1].layerType = "masked"; //变为被遮罩层
		timeline.setSelectedFrames(0, 1);
		msg('ROI绘制工程初始化完毕');
	}
	
}else
{
	timeline.currentLayer = 0 ;
	for (i=0; i<ln-1; i++)
	{ 
		var frameArray = layerArray[i].frames; //获取帧
		var fn = frameArray.length; //获取帧总数
		for (j=0; j<fn; j++)
		{ 
			if (j==frameArray[j].startFrame)
			{
				//跳转到该帧用
				timeline.setSelectedLayers(i);
				timeline.setSelectedFrames(j, j+1);
				var elements = frameArray[j].elements; //获取元素
				var en = elements.length; //获取元素总数
				for (k=0; k<en; k++)
				{ 
					if( "shape" == elements[k].elementType )
					{
						elements[k].selected = true;
						autoFill(elements[k]); //自动填充
					}
				}
			}
		}
	}
	dom.backgroundColor = backgroundColor;
	msg('填充操作完毕');
}

/*
*对shape对象自动填充
*/
function autoFill( cshape )
{
	if( cshape == null || "shape" != cshape.elementType ){    
		msg('自动填充参数无效。');
		return;
	}
	else{	
		msg('开始填充。');	
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
		dom.clipCut(); //通过剪切去除原始的边。
		//dom.deleteSelection(); //去除原始的边。
		path.makeShape(false,true); //画路径，不画边。
		setSolidFill(fillColor); //上色
	}
}
/*
*设置单色填充
*/
function setSolidFill(color)
{
	var fill = dom.getCustomFill();
	fill.style = 'solid';
	fill.color = color ;
	dom.setCustomFill(fill);
}
/*
*显示提示
*/
function msg(str,alt)
{
	fl.trace(str);
	if(alt)	alert(str);
}