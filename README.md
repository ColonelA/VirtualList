# VirtualList  虚拟列表开发说明   

1. 在公司业务中遇到了处理大数据的场景，自己去尝试使用虚拟列表的方式处理数据，但是最后实现的效果，存在瑕疵，所以根据所能查找的资料自己动手实践一下。

1. 虚拟列表思路   
  总体长度 = 真实列表长度 (可视区域 + 缓存区域)  
  利用数组高度得出滚动元素高度，并且设置
   

  ```javaScript 
 <!-- <div 
      ref={scrollingContainer}  
      style={{
        overflowX: "hidden",
        overflowY: "auto",
        height,
        position: "relative"
      }}  
      onScroll={onScroll}
    >      
      <div
        ref={phantomContentRef}
        style={{ height: phantomHeight, position: "relative" }}
      /> 
     
  <div> -->
 ```
scrollingContainer 作为包裹元素，拥有  position: "relative" 属性 
phantomContentRef 作为支撑面板元素，       

scrollingContainer 绑定onScroll 函数通过env.target.scrollTop 来计算当前滚动条更新的位置, 通过当前数据起始的位置    
 
通过scrollTop 来找到，当前滚动条的起始点。    

limit：当前画布展示数量。  
bufferSize：防止滚动过快，所添加的缓存区域
total - 1 总数最大值 
  
// 开始的位置 
setStartIndex = Math.max(currentStartIndex - bufferSize, 0);   

// 结束的位置
setEndIndex =Math.min(currentStartIndex +  limit + bufferSize,
    total - 1
); 
  