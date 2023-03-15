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
     rowRenderer
    } = props
  const [scrollTopValue,  updateScrollTopValue ] = useState<number>(0)
  

  const limit = Math.ceil(height / estimatedRowHeight);
  const [startIndex, setStartIndex ] = useState<number>(0);
  let originStartIdx: number = 0;  
  const [endIndex, setEndIndex ] = useState<number>(Math.min(originStartIdx + limit +  bufferSize, total - 1));

  const phantomContentRef = useRef<HTMLDivElement>(null);
  const actualContentRef = useRef<HTMLDivElement>(null);    
  let phantomHeight  = estimatedRowHeight * total;  
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


    

  const onScroll = (event: any)  => {  
     const { target } = event;

   if ( target === scrollingContainer.current) { 
 
    // 当前元素滚动距离
    const { scrollTop } = target;  
    const currentStartIndex = getStartIndex(scrollTop); 
   
    
    if (currentStartIndex !== originStartIdx) {  
        originStartIdx = currentStartIndex;
        setStartIndex(Math.max(currentStartIndex - bufferSize, 0));
        setEndIndex(Math.min(currentStartIndex +  limit + bufferSize,
          total - 1
        ));
        updateScrollTopValue(scrollTop)
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
