
function AND2BitArray(a,b){
  const length = a.length;
  let ans = [];
  for (let i =0; i< length; i++){
      ans[i] = a[i] & b[i];
  }
  return ans;
}

function countContinousSet(row,index){
  let count = 0;
  for(let i = index; i < row.length; i++){
    if(row[i] === -2){
      count++;
    }
    else{
      break;
    }
  }
  return count;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


function numSubSet(row, index){
  let count = 0;
  let current_index = index;
  while(row[current_index] ==0){
    count++;
    current_index++;
  }
  return count;
}

function generateMaze(rows, columns) {
  // Create the maze grid
  const maze = [];

  let counter = 1;

  //Với mỗi dòng, chúng ta sẽ copy thông tin từ 1 dòng trước (nếu như có), thực hiện phép And-Bit trên hai dòng đó

  for(let i = 0; i <rows; i++){
    row_one = [];
    row_two = [];

    //Khởi tạo row_one là mảng -1
    for(let j =0 ; j< columns; j++){
      row_one.push(-1);
    }

    const previous_row_2_index = i*2 -1;
    const previous_row_1_index = i*2 -2;

    //Trường hợp là i === 0 thì sẽ được chạy, tương đương với previous_row không khả thi
    if(i === 0){
      //khởi tạo row_one và row_two toàn 0
      for(let j =0 ; j< columns; j++){
        row_one[i] = 0;
      }
    }
    else{
      //Tường hợp khả thi thì chúng ta thực hiện phép AND bit để trên xuống để khởi tạo mảng bắt đầu
      previous_row_2 = maze[previous_row_2_index];
      previous_row_1 = maze[previous_row_1_index];
      masking_array = AND2BitArray(previous_row_1, previous_row_2);

      for(let j = 0; j < masking_array.length; j++){
        if(masking_array[j] === 0){
          row_one[j] = -2; //-2 tức là hiện tại đang cùng 1 set, sẽ cần phải gắn tường ở ngay vị trí đó
        }
      }
    }

    //Chúng ta sẽ xử lý tất cả các -2 trước
    for(let index =0; index< row_one.length; index++){
      if(row_one[index] === -2){
        const numCurrentSet = countContinousSet(row_one,index);
        for (let j = index; j < index+numCurrentSet; j+=2){
          row_one[index] = 1;
        }
        for (let j = index; j < numCurrentSet; j++){
          if(row_one[j] != 1){
            row_one[j] = 0;
          }
        }
      }
    }

    //Sau đó biến tất cả các -1 thành 0
    for(let index =0; index<row_one.length; index++){
      if(row_one[index] === -1){
        row_one[index] = 0;
      }
    }

    //Tạo cửa ngẫu nhiên các index
    for(let index= 0; index< row_one.length; index++){
      if(row_one[index] === 0){
        sub_set = []
        let j = index;
        while(j < row_one.length){
          if(row_one[j] === 0){
            sub_set.push(row_one[j]);
          }
          else{
            break;
          }
          j++;
        }

        if(sub_set.length === 1){
          //Coi như không xử lý gì cả
        }
        else if(sub_set.length === 2){
          //Random chọn hay là không
          const randomBoolean = Math.random() < 0.5 ? true : false;
          if(randomBoolean === true){
            row_one[index] = 1;
          }
        }
        else{
          const set_size = sub_set.length;
          let num_sub_set = randomNumber(0,set_size -1);
          for( let random = 0; random <num_sub_set; random++ ){
            let random_index = index + randomNumber(0,num_sub_set-1);
            let counter_index =0
            while(row_one[random_index] === 1){
              if(counter_index == 3){
                break;
              }
              random_index = index + randomNumber(0,num_sub_set-1);
              counter_index++;
            }
            console.log(random_index);
            row_one[random_index] = 1;
            console.log("Current row" + i +" "+row_one);
          }
          index = index + set_size -1;
        }
      }

    }
    console.log("Current row" + row_one);

    //Copy row_one qua row_two
    for(let index =0; index< row_one.length; index++){
      row_two.push(row_one[index]);
    }
    console.log("row two"+ row_two);

    //Thêm cửa dưới cho ma trận
    for(let index =0; index< row_two.length; index++){

      if(row_two[index] === 0) {
        const num_SubSet = numSubSet(row_two,index);
        if(num_SubSet == 1){
          //Do nothing
        }
        else{
          num_of_backWalls = randomNumber(1,num_SubSet-1);
          for(let num_of_backWall = 0; num_of_backWall < num_of_backWalls; num_of_backWall++){
            let random_backWall_index = index + randomNumber(0,num_of_backWalls);
            row_two[random_backWall_index] = 1;
          }
        }
        index = index + num_SubSet;
      }
    }

    maze.push(row_one);
    maze.push(row_two);

  }

  return maze;
}

console.log(generateMaze(15,15));
//console.log(AND2BitArray([0,1,0,1],[1,0,1,0]));
