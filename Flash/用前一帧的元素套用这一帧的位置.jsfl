var timeline = fl.getDocumentDOM().getTimeline(); 
var theSelectedFrames = timeline.getSelectedFrames();//3个一组的数组
var layern = theSelectedFrames.length/3;//获取组数
for(var j=0;j<layern;j++){
	//获取本组三个数据
	var tSF = new Array(theSelectedFrames[j*3+0],theSelectedFrames[j*3+1],theSelectedFrames[j*3+2]);
	//设置当前层
	fl.getDocumentDOM().getTimeline().setSelectedLayers(tSF[0]);
	var frameArray = timeline.layers[tSF[0]].frames;//本层帧
	for(var i=tSF[1];i<tSF[2];i++){
		if (frameArray.length < i){break;}
		if (i==frameArray[i].startFrame) {//如果是关键帧
			var oldframe = timeline.layers[tSF[0]].frames[i];
			var oldobj = oldframe.elements[0];
			oldobj.selected = true;
			var oldalpha = fl.getDocumentDOM().selection[0].colorAlphaPercent;
			timeline.clearKeyframes(i);
			timeline.insertKeyframe(i);
			var newframe = timeline.layers[tSF[0]].frames[i];
			var newobj = newframe.elements[0];
			newobj.selected = true;
			newobj.x = oldobj.x;
			newobj.y = oldobj.y;
			newobj.scaleX = oldobj.scaleX;
			newobj.scaleY = oldobj.scaleY;
			newobj.rotation = oldobj.rotation;
			//fl.getDocumentDOM().selection[0].colorAlphaPercent = oldalpha;
		}
	}
}