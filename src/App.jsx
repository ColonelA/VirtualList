import React from 'react';
import VirtualList from './VirtualList.tsx'
import faker from "faker"; 
import { css } from "@emotion/css";

  

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
  return ( <VirtualList   
            data={data}
           height={userVisibleHeight}
           total={dataLength} 
           estimatedRowHeight={estimateRowHeight}
           bufferSize={bufferSize}  
           rowRenderer={(index: number, styleData: any) => {
            const item = index;
            return (
              <div
                key={item}
                className={css`
                  width: 100%;
                  padding: 20px;
                  border-bottom: 1px solid #000;
                `}
                style={styleData}
                onClick={() => {
                  console.log("item-", index);
                }}
                id={`item-${index}`}
              >
                <span
                  className={css`
                    display: block;
                    color: rgba(0, 0, 0, 0, 85);
                    font-weight: 500;
                    font-size: 14px;
                  `}
                >
                  Item - {data[index].id} Data:
                </span>
                <span
                  className={css`
                    width: 100%;
                    color: rgba(0, 0, 0, 0.5);
                    font-size: 16px;
                  `}
                >
                  {data[index].value}
                </span>
              </div>
            );
          }}
      />)
};
