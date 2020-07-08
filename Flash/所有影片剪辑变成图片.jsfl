var layerArray = fl.getDocumentDOM().getTimeline().layers;
var ln = fl.getDocumentDOM().getTimeline().layerCount;
for (i=0; i<ln; i++) { 
	var frameArray = fl.getDocumentDOM().getTimeline().layers[i].frames;
	var fn = frameArray.length;
	for (j=0; j<fn; j++) { 
		if (j==frameArray[j].startFrame) {
			frameArray[j].elements.selected = true;
			fl.getDocumentDOM().getTimeline().setSelectedLayers(i);
			fl.getDocumentDOM().getTimeline().setSelectedFrames(j, j+1);
			fl.getDocumentDOM().setElementProperty('symbolType', 'graphic');
		}
	}
}
alert('²Ù×÷Íê±Ï');
