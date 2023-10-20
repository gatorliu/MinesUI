var cell_array = Array(16);

$(function () {
    //var cell_array = Array(16);
    var current_player
    var current_Idx
    var mouseDownCell
    var cutwayBtn = Array(5)
    cut_dirs = [
        []
      , [1, 0]
      , [0, 1]
      , [1, 1]
      , [1, -1]
    ]
    player_class = [
      ""
      ,"red"
      ,"green"
      ,"blue"
    ]
    
    function init() {
      mouseDown = 0
      for (i=0; i<16; i++) { 
        cell_array[i] = {
          cut_player:[NaN, "","","",""] 
          ,cut_cnt:0
          , cell : $('#'+i)
          , is_bomb: 0
        }; 
      }
      bomb = 0;
      while( bomb<2) {
        b = Math.floor(Math.random() * 16)
        if (cell_array[b].is_bomb == 0) {
          bomb += 1;
          cell_array[b].is_bomb = 1;
        }
      }
      // reset player 
      $('input[type="button"][value="P1"]').click()
      cutway = $('.cutway')
      cutway.prop('disabled',true)
     
      // cutwayBtn init
      cutway.each(i => cutwayBtn[i+1] = $(cutway[i]));
      
    }
    
    function reflash() {
      cell_array.forEach((elm, idx) => {
        //$('#'+idx+' > div > .cellinfo').text(elm.cut_cnt);
        //elm.cell.children().find('>.cellinfo').text(elm.cut_cnt);
        elm.cell.children().children().children().children().text(elm.cut_cnt);
   
      });
    }
    function encode(r, c) {
      return r*4+c;
    }
    function decode(v) {
      return [Math.floor(v/4), v%4];
    }
    function cut_change_style(idx, way ) {
        cell = cell_array[idx].cell
        for (i = 2 ; i<=way ; i++) {
          cell = cell.children()
        } 
        cell.addClass('cut'+way)
        cell.addClass(player_class[current_player])
    }
    function cut(idx, way ) {
      if ( cell_array[idx].cut_player[way] != 0 ) {
        return
      } 
      cell_array[idx].cut_player[way]= current_player
      cell_array[idx].cut_cnt += 1
      cut_change_style(idx, way) 

      var r, c
      [r, c] = decode(idx)
      while (true) {
          
          r +=  cut_dirs[way][0];
          c +=  cut_dirs[way][1];
          if (r<0 ||  r==4 || c<0 || c==4) break;

          i = encode(r, c)
          cell_array[i].cut_player[way]= current_player
          cell_array[i].cut_cnt += 1
          cut_change_style(i, way) 
          
      }
      [r, c] = decode(idx)
      while (true) {
          r -=  cut_dirs[way][0];
          c -=  cut_dirs[way][1];
          if (r<0 ||  r==4 || c<0 || c==4) break;

          i = encode(r, c)
          cell_array[i].cut_player[way]= current_player
          cell_array[i].cut_cnt += 1
          cut_change_style(i, way) 
      }
      
      reflash()
      p = ((parseInt(current_player)+1) % 4)
      p = p==0 ? 1: p
      $('input[type="button"][value="P' + p + '"]').click()
    }
    
    /*
    $('.cell').click(function(){  
      //console.log(cell_array[this.id].cut_cnt);
      current_Idx = this.id
      for( i=1; i<=4; i++) {
        if ( cell_array[this.id].cut_player[i] == "") {
            cutwayBtn[i].prop('disabled',false)
        }
      }
      
    });
    */
    $('.cutway').click(function(){
        cut(current_Idx,this.id)
        $('.cutway').prop('disabled',true)
      });
  
    $('#btnBomb').click(function(){
      cell_array.forEach((elm, idx) => {
        if (elm.is_bomb == 1) {
          elm.cell.children().children().children().children().addClass("bomb");
        }
      });
    });
    
    $('.player').click(function(){
      //current_player = parseInt(($(this).val())[1])
      current_player = ($(this).val())[1]
      $('.player').css('border', '1px solid #999')
      $(this).css('border', '2px solid #000')
    });


    $('.cell').mousedown(function(){
      console.log(this.id)
      mouseDownCell = this.id
      $(this).css('cursor', 'move')
    });
    $('.cell').mouseup(function(){
      //  計算 cut z; 
      if ( mouseDownCell ==this.id) {
        // 如果是4個角才處理
        if (mouseDownCell == 0) { // /4
          cut(mouseDownCell, 4 )
        } else if (mouseDownCell == 3) {  // \ 3
          cut(mouseDownCell, 3 )
        } else if (mouseDownCell == 12) {   // \ 3
          cut(mouseDownCell, 3 )
        } else if (mouseDownCell == 15) {  // /4
          cut(mouseDownCell, 4 )
        }
      } else {
        [r1, c1] = decode(mouseDownCell);
        [r2, c2] = decode(this.id);
        if ( r1 == r2) {   // -2
          cut(mouseDownCell, 2 )
        } else if(c1 == c2) { // |1 
          cut(mouseDownCell, 1 )
        } else if (r1-r2 == c1-c2) { // \3
          cut(mouseDownCell, 3 )
        } else if (r1-r2 == c2-c1) { // /4
          cut(mouseDownCell, 4 )
        }
      }
        

      $(this).css('cursor', 'default')
    });
    /*
    $('.cell').on("mousemove", function(event){
      //console.log(this.id)
          firstSeclectedCell  = this.id  

    });
    */
  
    init()
    reflash();
  
  });