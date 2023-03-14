import React from 'react';
import VirtualList from './VirtualList.tsx'
import faker from "faker";
  

const data = [];
const dataLength = 10000;
for (let id = 0; id < dataLength; ++id) {
  data.push({
    id,
    value: faker.lorem.sentences()
  });
}
  
 // 可见高度
const userVisibleHeight = 800; 
// 自适应预设高度
const estimateRowHeight = 94;   

// 防止快速滚动设置的上下缓冲区域大小
const bufferSize = 5;
 


export default function InitComp() { 
  return ( <VirtualList />)
};
