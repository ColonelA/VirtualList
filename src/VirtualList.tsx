import React, { useState, useRef, useEffect, } from 'react';
import { Empty } from 'antd'
import { binarySearch, CompareResult } from './binarySearch.tsx'
interface ViProps { 
    height:  number;
    total: number; 
    estimatedRowHeight: number;
    bufferSize?: number;  
    rowRenderer?:  () => any;   
    noDataContent?: React.ReactNode;
} 


interface CachedPosition {
  index: number;
  top: number;
  bottom: number;
  height: number;
  dValue: number;
}
 

function VirtualList(props: ViProps) {  
  const { 
     height, 
     total, 
     estimatedRowHeight, 
     bufferSize = 5,  
     noDataContent, 
     rowRenderer, 
    } = props

  const limit = Math.ceil(height / estimatedRowHeight);
  const [startIndex, setStartIndex ] = useState<number>(0);
  let originStartIdx: number = 0;  
  const [endIndex, setEndIndex] = useState<number>(Math.min(originStartIdx + limit +  bufferSize, total - 1));

  const phantomContentRef = useRef<HTMLDivElement>(null);
  const actualContentRef = useRef<HTMLDivElement>(null);    
  const [phantomHeight, setPhantomHeight ]  =useState<number>(estimatedRowHeight * total) ;  
  const scrollingContainer = useRef<HTMLDivElement>(null);
  const [cachedPositions, setCachedPositions] = useState<CachedPosition[]>([]);
  
  useEffect (() => { 
      let cached = [];
      for (let index = 0; index < total; index++) {         
        cached[index] = {   
          index: index,  
          height: estimatedRowHeight, 
          top: index * estimatedRowHeight,
          bottom: (index + 1) * estimatedRowHeight,
          dValue: 0,
        }
      };
      setCachedPositions(cached);
  }, []) 

   
  
   const getStartIndex = (indexScrollTop = 0) => { 
     let idx = 0
      
     const calcFindValue = (currentValue: CachedPosition, targetValue: number) => { 
      const currentCompareValue = currentValue.bottom;     
      if (currentCompareValue === targetValue) {
        return CompareResult.eq;
      }

      if (currentCompareValue < targetValue) {
        return CompareResult.lt;
      }  
     
      return CompareResult.gt;
    };

    idx = binarySearch<CachedPosition,number>(cachedPositions, indexScrollTop , calcFindValue )
  
    const targetItem = cachedPositions[idx]
    if (targetItem.bottom < indexScrollTop) {
      idx += 1;
    }  

    return idx;
   }

  const [changTime, setChangTime] = useState<number>();
  const onScroll = (event: any)  => {  
    const { target } = event;
   if (target === scrollingContainer.current) { 
    // 当前元素滚动距离
    const { scrollTop } = target;  
    const currentStartIndex = getStartIndex(scrollTop); 
   
    if (currentStartIndex !== originStartIdx) {  
        originStartIdx = currentStartIndex;
        setStartIndex(Math.max(currentStartIndex - bufferSize, 0));
        setEndIndex(Math.min(currentStartIndex +  limit + bufferSize,
          total - 1
        )); 
        setChangTime(new Date().getTime())
    }
   }         
  } 
 

  const renderDisplayContent = () => {
    const content = [];     
    for (let i = startIndex; i <= endIndex; ++i) {
      content.push(
        rowRenderer(i, {
          left: 0,
          right: 0,
          width: "100%"
        })
      );
    }
    return content;
  }; 

  
  const getTransform = () =>
    `translate3d(0,${
      startIndex >= 1
        ? cachedPositions[startIndex - 1].bottom
        : 0
    }px,0)`;  

    
 
  useEffect( ()  => { 
    if (actualContentRef.current && total > 0 && (Array.isArray(cachedPositions) && cachedPositions.length  !== 0)) {  
      const { current: { childNodes } } = actualContentRef
      const nodes: NodeListOf<any> = childNodes;
      const startNode = nodes[0];
  
      nodes.forEach((node: HTMLDivElement) => { 
      const rect = node.getBoundingClientRect ? node.getBoundingClientRect() : false; 
        if (!node) {
          return;
        }  
    
        if (rect) {
          const { height } = rect; 
          const index = Number(node.id.split("-")[1]);
          const oldHeight = cachedPositions[index].height;
          const dValue = oldHeight - height;  
  
          cachedPositions[index].bottom -= dValue;
          cachedPositions[index].height = height;
          cachedPositions[index].dValue = dValue;
          let startIdx = 0;  

          const { nextSibling } = startNode

         if (startNode) {
            startIdx = Number(nextSibling.id.split("-")[1]);
         }

        const cachedPositionsLen = cachedPositions.length;
        let cumulativeDiffHeight = cachedPositions[startIdx].dValue; 
        cachedPositions[startIdx].dValue = 0;  

        for (let i = startIdx + 1; i < cachedPositionsLen; ++i) {
          const item = cachedPositions[i];
      
           cachedPositions[i].top = cachedPositions[i - 1].bottom;
           cachedPositions[i].bottom =
           cachedPositions[i].bottom - cumulativeDiffHeight;
    
          if (item.dValue !== 0) {
            cumulativeDiffHeight += item.dValue;
            item.dValue = 0;
          }
        }     
          setCachedPositions(cachedPositions)
          setPhantomHeight(cachedPositions[cachedPositionsLen - 1].bottom)
        }
      })
    }
  } , [changTime]) 

 
 
  
  return (
    <div 
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
       <div 
         style={{ 
          width: '100%', 
          position: 'absolute', 
          top:0,  
          transform: getTransform()
        }}  
        ref={actualContentRef}
      > {renderDisplayContent()}</div>
 
        {total === 0 && (noDataContent || <Empty />)}
    </div>
  );
}

export default VirtualList;
