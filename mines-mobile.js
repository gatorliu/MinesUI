CELL_ARRAY = Array(16);
$(function () {
    //var CELL_ARRAY = Array(16);
    var PG_INFO; 
    var TOUCH_INFO; // PlayGround info
    var CURRENT_PLAYER
    var CUT_START_CELL
    CUT_DIRS = [
        []
      , [1, 0]
      , [0, 1]
      , [1, 1]
      , [1, -1]
    ]
    PLAYER_CLASS = [
       "red"
      ,"green"
      ,"blue"
    ]
    
    function init() {
      mouseDown = 0
      for (i=0; i<16; i++) { 
        CELL_ARRAY[i] = {
          cut_player:[NaN, -1,-1,-1,-1] 
          ,cut_cnt:0
          , cell : $('#'+i)
          , is_bomb: 0
        }; 
      }
      bomb = 0;
      while( bomb<2) {
        b = Math.floor(Math.random() * 16)
        if (CELL_ARRAY[b].is_bomb == 0) {
          bomb += 1;
          CELL_ARRAY[b].is_bomb = 1;
        }
      }
      // reset player 
      $('input[type="button"]#p0').click()
      cutway = $('.cutway')
      cutway.prop('disabled',true)
     
      // PG_INFO
      pg = $('.wrapper')
      offset = pg.offset();
      cell0_offset = $('#0').offset()
      PG_INFO = {
          top: offset.top 
        , left : offset.left
        , bottom: offset.top  + pg.height()
        , right: offset.left  + pg.width()
        , cells_width: $('#1').offset().left - cell0_offset.left  // cells_width = left padding+width
        , cells_height: $('#4').offset().top - cell0_offset.top
      }
      //PG_INFO['bottom'] = PG_INFO['top'] + pg.height()
      //PG_INFO['right'] = PG_INFO['left'] + pg.width()
      TOUCH_INFO = {
          touch: false
        , start_x:0
        , start_y:0
        , current_x:0 
        , current_y:0 
      };
      
    }
    
    function reflash() {
      CELL_ARRAY.forEach((elm, idx) => {
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
        cell = CELL_ARRAY[idx].cell
        for (i = 2 ; i<=way ; i++) {
          cell = cell.children()
        } 
        cell.addClass('cut'+way)
        cell.addClass(PLAYER_CLASS[CURRENT_PLAYER])
    }
    function cut(idx, way ) {
        
      if ( CELL_ARRAY[idx].cut_player[way] != -1 ) {
        //console.log("idx, way , cut " + idx + "," + way + ": " + CELL_ARRAY[idx].cut_player )
        return
      } 
      CELL_ARRAY[idx].cut_player[way]= CURRENT_PLAYER
      CELL_ARRAY[idx].cut_cnt += 1
      cut_change_style(idx, way) 

      var r, c
      [r, c] = decode(idx)
      while (true) {
          r +=  CUT_DIRS[way][0];
          c +=  CUT_DIRS[way][1];
          if (r<0 ||  r==4 || c<0 || c==4) break;

          i = encode(r, c)
          CELL_ARRAY[i].cut_player[way]= CURRENT_PLAYER
          CELL_ARRAY[i].cut_cnt += 1
          cut_change_style(i, way) 
          
      }
      [r, c] = decode(idx)
      while (true) {
          r -=  CUT_DIRS[way][0];
          c -=  CUT_DIRS[way][1];
          if (r<0 ||  r==4 || c<0 || c==4) break;

          i = encode(r, c)
          CELL_ARRAY[i].cut_player[way]= CURRENT_PLAYER
          CELL_ARRAY[i].cut_cnt += 1
          cut_change_style(i, way) 
      }
      
      reflash()
      
      // Change Player
      p = (CURRENT_PLAYER+1) % 3
      $('input[type="button"]#p' + p ).click()
    }


    function CutCal ( id ){
        //console.log(CUT_START_CELL + " -> " + id)
        //  計算 cut z; 
        if ( CUT_START_CELL == id) {
          // 如果是4個角才處理
          if (CUT_START_CELL == 0) { // /4
            cut(CUT_START_CELL, 4 )
          } else if (CUT_START_CELL == 3) {  // \ 3
            cut(CUT_START_CELL, 3 )
          } else if (CUT_START_CELL == 12) {   // \ 3
            cut(CUT_START_CELL, 3 )
          } else if (CUT_START_CELL == 15) {  // /4
            cut(CUT_START_CELL, 4 )
          }
        } else {
          [r1, c1] = decode(CUT_START_CELL);
          [r2, c2] = decode(id);
          if ( r1 == r2) {   // -2
            cut(CUT_START_CELL, 2 )
          } else if(c1 == c2) { // |1 
            cut(CUT_START_CELL, 1 )
          } else if (r1-r2 == c1-c2) { // \3
            cut(CUT_START_CELL, 3 )
          } else if (r1-r2 == c2-c1) { // /4
            cut(CUT_START_CELL, 4 )
          }
       }
        $(this).css('cursor', 'default')
        firstSeclectedCell = 0
    }

    function CutCalMobile() {  
        x = TOUCH_INFO.current_x  - PG_INFO.left 
        y = TOUCH_INFO.current_y - PG_INFO.top
        
        c = Math.floor(x / PG_INFO.cells_width)
        r = Math.floor(y / PG_INFO.cells_height)
        c = c >= 4 ? 3 : c
        r = r >= 4 ? 3 : r
        //console.log("(r, c) = (" + r +"," + c + ")")
        id = encode(r,c)
        
        if (   ( id == 0  && CUT_START_CELL== 0 )
            || ( id == 3  && CUT_START_CELL== 3 )
            || ( id == 12 && CUT_START_CELL== 12 )
            || ( id == 15 && CUT_START_CELL== 15 )
        ) { 
            w_x = TOUCH_INFO.current_x - TOUCH_INFO.start_x
            w_y = TOUCH_INFO.current_y - TOUCH_INFO.start_y
            w_x = Math.abs(Math.abs(w_x)) < 10 ? 0 : w_x
            w_y = Math.abs(Math.abs(w_y)) < 10 ? 0 : w_y
            w = 0
            if (w_x * w_y > 0) { w = 3 }
            else if (w_x * w_y < 0) { w = 4 }

            if (   
               ( id == 0  &&  w == 4 )
            || ( id == 3  && w == 3 )
            || ( id == 12 && w == 3 )
            || ( id == 15 && w == 4 ) ) {
                CutCal( id );
            }
        } else {
            CutCal( id );
        }
    }
      
    $('#btnBomb').click(function(){
      CELL_ARRAY.forEach((elm, idx) => {
        if (elm.is_bomb == 1) {
          elm.cell.children().children().children().children().addClass("bomb");
        }
      });
    });
    
    $('.player').click(function() {
      CURRENT_PLAYER = parseInt(($(this).attr('id'))[1])
      console.log("CURRENT_PLAYER " + CURRENT_PLAYER)
      $('.player').css('border', '1px solid #999')
      $(this).css('border', '2px solid #000')
    });

    $('.cell').on('touchstart', function(event){
        if (event.touches && event.touches.length) {
            CUT_START_CELL = this.id
            TOUCH_INFO.touch = true
            TOUCH_INFO.current_x = event.touches[0].clientX;
            TOUCH_INFO.current_y = event.touches[0].clientY;
            TOUCH_INFO.start_x = TOUCH_INFO.current_x;
            TOUCH_INFO.start_y = TOUCH_INFO.current_y;
            //console.log("touchstart " + TOUCH_INFO.x +"," + TOUCH_INFO.y)
        }
        
    });

    $('.cell').on('touchend', function(event){
        //console.log(this.id)   // always retunn touchstart's this.id 
        if ( TOUCH_INFO.touch) {
            TOUCH_INFO.touch = false;
            //console.log("touchend " + TOUCH_INFO.current_x  +"," + TOUCH_INFO.current_y)
            CutCalMobile()
        }
        
    });
    $('.wrapper').on('touchmove', function(event){
      if ( TOUCH_INFO.touch  && event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
        if (   x < PG_INFO.left || x > PG_INFO.right
            || y < PG_INFO.top  || y > PG_INFO.bottom
        ) 
        { 
            TOUCH_INFO.touch = false;
            //console.log("touchmove(end) " + x +"," + y)
            CutCalMobile()
        }
        else {
            TOUCH_INFO.current_x = x;
            TOUCH_INFO.current_y = y;
        }
        
      }
    });

    init()
    reflash();
  
  });