
$(function () {
    var CELL_ARRAY = Array(16);
    var PG_INFO;    // PlayGround info
    var TOUCH_INFO; 
    var CURRENT_PLAYER
    const CUT_DIRS = [ [], [1, 0], [0, 1], [1, 1], [1, -1]]
    const PLAYER_CLASS = [ "red", "green", "blue"]

    
 

      
    const init = () => {
        
        // Playground(Canvas)
        pg = $('#playground');
        // 設定 canvas html's width/height = css.width/height canvas 座標才會對
        pg[0].width  = pg.width()
        pg[0].height = pg.height()

        ctx = pg[0].getContext('2d')
        ctx.lineWidth = 3
    
        checkerboard = $('.wrapper')
        PG_INFO = {
            pg: pg
            , ctx : ctx
            , w: pg.width()
            , h: pg.height()
            , checkerboard: {
                 left : checkerboard.offset().left - pg.offset().left  // 對應到 playground 的 offset 
                , top : checkerboard.offset().top - pg.offset().top 
                }
            , cell : { 
                  w: $('#1').offset().left - $('#0').offset().left  // cells_width = left padding+width
                , h: $('#4').offset().top - $('#0').offset().top
            }
            , left : pg.offset().left
            , top: pg.offset().top 
            , bound : {
                left: 10, top: 10, right: pg.width() -10, bottom: pg.height() -10
            }
        };
        
        TOUCH_INFO = {
            touch: false
            , start : {x:0, y:0}
            , end: {x:0, y:0 }
        };

        // Cell info in Matrix (CELL_ARRAY)
        for (i=0; i<16; i++) { 
            var r,c 
            [r, c] = idx2rc(i)
            CELL_ARRAY[i] = {
                cut_player:[NaN, -1,-1,-1,-1] 
                ,cut_cnt:0
                , cell : $('#'+i)
                , is_bomb: 0
                , left: PG_INFO.checkerboard.left + c * PG_INFO.cell.w
                , right:PG_INFO.checkerboard.left + (c+1) * PG_INFO.cell.w
                , top: PG_INFO.checkerboard.top + r * PG_INFO.cell.h
                , bottom: PG_INFO.checkerboard.top + (r+1) * PG_INFO.cell.h
                }; 
        }
        console.log(CELL_ARRAY)
        console.log(PG_INFO)
        // setting BOMB
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
    }
    
    const reflash = () => {
      CELL_ARRAY.forEach((elm, idx) => {
        //$('#'+idx+' > div > .cellinfo').text(elm.cut_cnt);
        //elm.cell.children().find('>.cellinfo').text(elm.cut_cnt);
        elm.cell.children().children().children().children().text(elm.cut_cnt);
      });
    }
    const rc2idx = (r, c, size=4) => {
        return r*size+c;
    }

    const idx2rc = (idx) =>  {
        return [Math.floor(idx/4), idx%4];
    }

    const cellStyleChange = (idx, way ) => {
        cell = CELL_ARRAY[idx].cell
        for (i = 2 ; i<=way ; i++) {
          cell = cell.children()
        } 
        cell.addClass('cut'+way)
        cell.addClass(PLAYER_CLASS[CURRENT_PLAYER])
    }
    const cellStateChange = (idx, way) =>  {  
        if ( CELL_ARRAY[idx].cut_player[way] != -1 ) {
            return
        } 
        CELL_ARRAY[idx].cut_player[way]= CURRENT_PLAYER
        CELL_ARRAY[idx].cut_cnt += 1
        cellStyleChange(idx, way) 

        var r, c
        [r, c] = idx2rc(idx)
        while (true) {
            r +=  CUT_DIRS[way][0];
            c +=  CUT_DIRS[way][1];
            if (r<0 ||  r==4 || c<0 || c==4) break;

            i = rc2idx(r, c)
            CELL_ARRAY[i].cut_player[way]= CURRENT_PLAYER
            CELL_ARRAY[i].cut_cnt += 1
            cellStyleChange(i, way) 
            
        }
        [r, c] = idx2rc(idx)
        while (true) {
            r -=  CUT_DIRS[way][0];
            c -=  CUT_DIRS[way][1];
            if (r<0 ||  r==4 || c<0 || c==4) break;

            i = rc2idx(r, c)
            CELL_ARRAY[i].cut_player[way]= CURRENT_PLAYER
            CELL_ARRAY[i].cut_cnt += 1
            cellStyleChange(i, way) 
        } 
        reflash()
        // Change Player
        p = (CURRENT_PLAYER+1) % 3
        $('input[type="button"]#p' + p ).click()
    }


    function cutCalculate ( start_cell, end_cell ){
        console.log(start_cell + " -> " + end_cell)
        //  計算 cut z; 
        if ( start_cell == end_cell) {
          // 如果是4個角才處理
          if (start_cell == 0) { // /4
            cellStateChange(start_cell, 4 )
          } else if (start_cell == 3) {  // \ 3
            cellStateChange(start_cell, 3 )
          } else if (start_cell == 12) {   // \ 3
            cellStateChange(start_cell, 3 )
          } else if (start_cell == 15) {  // /4
            cellStateChange(start_cell, 4 )
          }
        } else {
          [r1, c1] = idx2rc(start_cell);
          [r2, c2] = idx2rc(end_cell);
          if ( r1 == r2) {   // -2
            cellStateChange(start_cell, 2 )
          } else if(c1 == c2) { // |1 
            cellStateChange(start_cell, 1 )
          } else if (r1-r2 == c1-c2) { // \3
            cellStateChange(start_cell, 3 )
          } else if (r1-r2 == c2-c1) { // /4
            cellStateChange(start_cell, 4 )
          }
       }
        $(this).css('cursor', 'default')
    }

    function position2Cellidx(pos) {  
        outbound = false
        x = pos.x  - PG_INFO.checkerboard.left 
        y = pos.y - PG_INFO.checkerboard.top
        //console.log(x,y)
        
        c = Math.floor(x / PG_INFO.cell.w)
        r = Math.floor(y / PG_INFO.cell.h)
        // c = c >= 4 ? 3 : c
        // r = r >= 4 ? 3 : r
        //console.log("(r, c) = (" + r +"," + c + ")")
        if (c < 0 || c > 3 || r < 0 || r > 3 ) {
            outbound = true
        }
        return {r,c, outbound}
    }
    function cut() {  
        try {
            //console.log(PG_INFO)
            //console.log(TOUCH_INFO)
            var start_cell = NaN, end_cell = NaN
            s = position2Cellidx(TOUCH_INFO.start)
            e = position2Cellidx(TOUCH_INFO.end)
            if (s.outbound || e.outbound) { 
                console.log(s.outbound, e.outbound)
                // 特判
                if (s.r == e.r && s.r >=0 && s.r <=3) { // 橫線
                    start_cell= rc2idx(s.r, 0)
                    end_cell= rc2idx(e.r, 1)    
                } else if (s.c == e.c && s.c >=0 && s.c <=3) {
                    start_cell= rc2idx(0, s.c)
                    end_cell= rc2idx(1, e.c)    
                } else {
                    // 4個角處理
                    /* 
                    目前方式不是太好，如果切割線太斜，無法判斷
                    可以優化， 以 Cell 0為例:
                    如果切過 Cell0 表示，Cell左上角，必定與另外三個點，在切割線的不同測
                    */
                    // idx往左上hift (4x4 = > 6x6 ) 原來 {0, 0} = > {1, 1}, {-1, -1} = > {0, 0}, 
                    s_idx = rc2idx(s.r+1, s.c+1, 6);
                    e_idx = rc2idx(e.r+1, e.c+1, 6);
                    //console.log(s_idx, e_idx)
                    if        (s_idx + e_idx == 7 && (s_idx==1   || e_idx==1  )) {
                        cutCalculate( 0, 0 );
                    } else if (s_idx + e_idx == 15 && (s_idx==4  || e_idx==4  )) {
                        cutCalculate( 3, 3 );
                    } else if (s_idx + e_idx == 55 && (s_idx==24 || e_idx==24 )) {
                        cutCalculate( 12, 12 );
                    } else if (s_idx + e_idx == 63 && (s_idx==29 || e_idx==29)) {
                        cutCalculate( 15, 15 );
                    } else {
                        return false;
                    }
                    return true
                }
            } else {
                start_cell= rc2idx(s.r,s.c)
                end_cell= rc2idx(e.r,e.c)
            }

            if (   ( end_cell == 0  && start_cell== 0 )
                || ( end_cell == 3  && start_cell== 3 )
                || ( end_cell == 12 && start_cell== 12 )
                || ( end_cell == 15 && start_cell== 15 )
            ) { 
                w_x = TOUCH_INFO.end.x - TOUCH_INFO.start.x
                w_y = TOUCH_INFO.end.y - TOUCH_INFO.start.y
                w_x = Math.abs(Math.abs(w_x)) < 10 ? 0 : w_x
                w_y = Math.abs(Math.abs(w_y)) < 10 ? 0 : w_y
                w = 0
                if (w_x * w_y > 0) { w = 3 }
                else if (w_x * w_y < 0) { w = 4 }

                if (   
                ( end_cell == 0  &&  w == 4 )
                || ( end_cell == 3  && w == 3 )
                || ( end_cell == 12 && w == 3 )
                || ( end_cell == 15 && w == 4 ) ) {
                    cutCalculate( start_cell, end_cell );
                }
            } else {
                cutCalculate( start_cell, end_cell );
            }
        } catch(e) {
            return false
        }
        return true
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
      //console.log("CURRENT_PLAYER " + CURRENT_PLAYER)
      $('.player').css('border', '1px solid #999')
      $(this).css('border', '2px solid #000')
      PG_INFO.ctx.strokeStyle = PLAYER_CLASS[CURRENT_PLAYER]
    });
  
    const drawLine = () => {
        PG_INFO.ctx.beginPath();
        PG_INFO.ctx.moveTo(TOUCH_INFO.start.x, TOUCH_INFO.start.y);
        PG_INFO.ctx.lineTo(TOUCH_INFO.end.x,   TOUCH_INFO.end.y);
        PG_INFO.ctx.stroke();
     }
     
    const getCanvasPosition = (event) => {
        const {pageX, pageY} = event.touches ? event.touches[0] : event;
        const x = pageX - PG_INFO.left;
        const y = pageY - PG_INFO.top;
        return { x, y}
    }

    const clearCanvas = () => {
        PG_INFO.ctx.clearRect(0, 0, PG_INFO.w, PG_INFO.h);
     }
   
    const mousedownHandler = (event) => {
        TOUCH_INFO.start  = getCanvasPosition(event);
        //console.log(TOUCH_INFO.start.x, TOUCH_INFO.start.y)
        TOUCH_INFO.touch = true;
     }
     
     const mousemoveHandler = (event) => {
       if(!TOUCH_INFO.touch) return;
       
       TOUCH_INFO.end = getCanvasPosition(event);
       //console.log(TOUCH_INFO.end.x, TOUCH_INFO.end.y)
       if ( TOUCH_INFO.end.x < PG_INFO.bound.left  
          || TOUCH_INFO.end.x > PG_INFO.bound.right
          || TOUCH_INFO.end.y < PG_INFO.bound.top
          || TOUCH_INFO.end.y > PG_INFO.bound.bottom
        ) 
        {  // 以防超出邊界
            TOUCH_INFO.touch = false;
            if (cut())
             clearCanvas();
        } else {
            clearCanvas();
            drawLine();
        }
     }
     
     const mouseupHandler = (event) => {
       //console.log(TOUCH_INFO.end.x, TOUCH_INFO.end.y)
       TOUCH_INFO.touch = false;
       if (cut())
        clearCanvas();
       
     }
        
     init()
     reflash();
   
     PG_INFO.pg.mousedown(mousedownHandler);
     PG_INFO.pg.mousemove(mousemoveHandler);
     PG_INFO.pg.mouseup(mouseupHandler);
     
     PG_INFO.pg.on('touchstart', mousedownHandler);
     PG_INFO.pg.on('touchmove', mousemoveHandler);
     PG_INFO.pg.on('touchend', mouseupHandler);
  });
  