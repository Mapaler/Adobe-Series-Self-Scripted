var dom = fl.getDocumentDOM();  
var timeline =  dom.getTimeline(); //获取时间轴
var layerArray = timeline.layers; //获取层
var ln = timeline.layerCount; //获取层总数
var PublishProfileURI = fl.configURI + "Commands/ROI_tools/PNG_default_profile.xml"; //默认发布配置XML位置
var PublishProfileName = "PNG default"; //默认发布配置名称
var nconvertURI = FLfile.uriToPlatformPath(fl.configURI + "Commands/ROI_tools/nconvert.exe"); //NConvert位置

var myDate = new Date();
msg(myDate.toLocaleTimeString());//显示时间

if(ln<2)
{
	var frameArray = layerArray[0].frames; //获取帧
	var fn = frameArray.length; //获取帧总数
	/*
	if (fn < 2)
	{
		//var uri = fl.browseForFileURL("open","选择导入的截面图片","图片 (*.bmp;*.jpg;*.png) ","bmp;jpg;png"); //获取导出位置
		//dom.importFile(uri);
	}else
	{
		//msg('工程匹配舞台初始化完成');
	}
	*/
	msg('工程尚未初始化',true);
}else
{
	dom.importPublishProfile(PublishProfileURI); //导入默认的PNG配置
	dom.currentPublishProfile = PublishProfileName;  //切换到PNG配置
	var VOI = confirm("保存VOI(Images from ROI)？\r\n“确定”保存VOI，“取消”保存ROI");
	if (VOI)
	{
		layerArray[0].locked = true; //锁定遮罩层
		layerArray[ln-1].locked = true; //锁定图片层
		layerArray[0].outline = false; //显示出遮罩层
		var suffix = "_VOI_";
		var picAction = "-grey 256";
	}else
	{
		layerArray[ln-1].visible = false; //隐藏图片层
		layerArray[0].outline = false; //显示出遮罩层
		var suffix = "_ROI_";
		var picAction = "-binary nodither";
	}
	var uri_t = fl.browseForFileURL("save","选择VOI/ROI导出位置","BMP 图片 (*.bmp) ","bmp"); //获取导出位置
	//以上格式适合CC，CS4-CS6参见 http://help.adobe.com/zh_CN/flash/cs/extend/WS5b3ccc516d4fbf351e63e3d118a9024f3f-7d3aCS5.html
	uri_t = (uri_t == null || uri_t.length < 0) ? null : uri_t.replace(/\.\w+$/,".png"); //要把扩展名替换成png，输出文件名才不会变化
	var uri = new urlObj(uri_t); //存入类
	if (uri.path == null || uri.path.length < 0)
	{
		msg("取消文件选择操作");
	}else
	{
		var frameArray = layerArray[ln-1].frames; //获取图片层的帧
		var fn = frameArray.length; //获取帧总数
		msg ("总共导出帧数： " + fn);
		//获取原始图片DPI
		var picDPI = getDPI(frameArray[0].elements[0].libraryItem.sourceFilePath);
		msg ("原始图片DPI： " + picDPI);
		//导出部分
		var bk = dom.exportPNG(uri.path, true, false); //不显示配置框，导出全部
		if (bk)
		{
			msg("导出PNG序列完毕");
			//生成转码用Bat
			var batTEXT = "";
			batTEXT += "@echo off\r\n";
			batTEXT += "chcp 65001\r\n";
			batTEXT += "Set nconvertPath=" + nconvertURI + "\r\n";
			batTEXT += "Set exportFolder=" + FLfile.uriToPlatformPath(uri.folder) + "\r\n";
			for (j=0; j<fn; j++)
			{
				if (j==frameArray[j].startFrame)
				{
					var element = frameArray[j].elements[0]; //获取元素
					var fileURI = new urlObj(element.libraryItem.sourceFilePath); //文件完整路径
					var re =/([^\/\\]+?)(\d{8}|\d{4})\.\w+$/; //原始图片文件名的正则表达式
					var result= fileURI.fullfilename.match(re); //执行正则搜索
					if(result)
					{
						batTEXT +=	'title 正在转换	' + j + '/' + fn + '\r\n';
						batTEXT +=	'"%nconvertPath%" -out bmp ' + picAction + ' -overwrite -D -dpi ' + picDPI + ' -o "%exportFolder%/'
									+ result[1].replace(/_$/,"")  //去除原始文件名最后可能的下划线
									+ suffix + result[2] + '.bmp" "%exportFolder%/' + uri.filename + fmtNum(j+1,4) + '.png"\r\n'; 
					}else
					{
						msg("err:帧 " + j + " 未找到图片文件名。"); 
					}
				}
			}
			msg("开始转码为二进制BMP");
			var batPath = uri.folder + "/converttemp.bat";
			FLfile.write(batPath, batTEXT); //写入转码用BAT
			var cmdstr = FLfile.uriToPlatformPath(batPath).replace(/\\/igm,'\\\\');
			FLfile.runCommandLine('"' +cmdstr + '"'); //执行BAT
			FLfile.remove(batPath);//删除BAT
			msg("导出操作完毕");
		}else
		{
			msg("取消操作 or 导出失败");
		}

	}
	dom.deletePublishProfile();  //删除PNG配置
	if (VOI)
	{
		layerArray[0].locked = false; //解锁遮罩层
		layerArray[0].outline = true; //显示出遮罩层
	}else
	{
		layerArray[ln-1].visible = true; //隐藏图片层
		layerArray[0].outline = true; //显示出遮罩层
	}
}
/*
*显示提示
*/
function msg(str,alt)
{
	fl.trace(str);
	if(alt)	alert(str);
}
/*
*获取图片DPI
*/
function getDPI(path)
{
	var DPItempPath = uri.folder + '/DPItemp.txt';
	//生成图片信息
	var cmdstr = '"' + nconvertURI.replace(/\\/igm,'\\\\') + '" -info -quiet "' + FLfile.uriToPlatformPath(path).replace(/\\/igm,'\\\\') + '" > "' + FLfile.uriToPlatformPath(DPItempPath).replace(/\\/igm,'\\\\') + '"';
	FLfile.runCommandLine('"' +cmdstr + '"'); //执行
	var code = FLfile.read(DPItempPath); //读取生成的临时文件
	FLfile.remove(DPItempPath);
	var re =/^\s*Xdpi\s+:\s*(\d+)\s*$/im
	var DPIvalue = code.match(re);
	if(DPIvalue)
	{
		return DPIvalue[1];
	}else
	{
		return 72; 
	}
}
/*
*路径对象
*/
function urlObj(path){ //use constructor
	if (path == null || path.length < 0)
	{
		this.path= null;
		return this;
	}else
	{
		//全路径
		this.path=path;
		//全文件名
		var arrUrl = path.split("/");
		this.fullfilename = arrUrl[arrUrl.length-1];
		//扩展名
		var arrUrl = this.fullfilename.split(".");
		this.extension = arrUrl[arrUrl.length-1];
		//文件名
		this.filename = this.fullfilename.substr(0,this.fullfilename.length - this.extension.length - 1);
		//父文件夹路径
		this.folder = path.substr(0,path.length - this.fullfilename.length - 1);
		return this;
	}
}
/*
*数字等宽
*/
function fmtNum(num,length,chr)
{
	length = length ? length : 4;
	chr = chr ? chr : "0";
	num = num.toString();
	chr = chr.toString();
	if (num.length < length)
	{
		var space = "";
		for (it = 0;it < length - num.length;it++)
		{
			space += chr;
		}
		return space + num;
	}else
	{
		return num;
	}
}