<template>
  <div class="process-tool-bar-content" :class="direction === 'column' ? 'row-y': 'row-x'">
      <div class="process-tool-bar-column" v-if="direction === 'column'" :style="{'flexDirection': direction}" @click.prevent.stop="adjustProcess($event)">
        <div class="current-process" @mousedown.prevent.stop="adjustProcess($event, 'drag')"
             :style="{
      'marginTop' : ((1 - localProcess / 100) * toolbarLength - 10 >= toolbarLength) ? toolbarLength + 'px' : (1 - localProcess / 100) * toolbarLength - 10  + 'px'
    }"></div>
        <div class="process-percent"  :style="{
      'height':localProcess / 100 * toolbarLength  + 'px'
    }"></div>
      </div>
    <div class="process-tool-bar-row" v-if="direction === 'row'" :style="{'flexDirection': direction}" @click.prevent.stop="adjustProcess($event)">
      <div class="process-percent"  :style="{
      'width': localProcess / 100 * toolbarLength  + 'px'
    }"></div>
      <div class="current-process" @mousedown.prevent.stop="adjustProcess($event, 'drag')"
           :style="{
       'marginLeft' : 0
    }"></div>
    </div>
  </div>
</template>

<script>
    import {fromEvent} from "rxjs";
    import {takeUntil} from "rxjs/operators";

    export default {
      name: "process-bar",
      data() {
          return {
            dragEventSubscription$: null,
            dragEndEventSubscription$: null,
            dragEventMouseLeaveSubscription$: null,
            dragEventMouseLeave$: null,
            dragEndEvent$: null,
            dragEvent$: null,
            localProcess: this.process
          }
      },
      methods: {
        adjustProcess(e, by = 'click') {
          const d =  this.direction === 'row' ? 'X' : 'Y';
          if (by === 'drag') {
            const currentProcess = this.localProcess;
            this.dragEventSubscription$ && this.dragEventSubscription$.unsubscribe();
            this.dragEndEventSubscription$ && this.dragEndEventSubscription$.unsubscribe();
            this.dragEventMouseLeaveSubscription$ && this.dragEventMouseLeaveSubscription$.unsubscribe();
            this.dragEventMouseLeave$ = fromEvent(document.getElementsByTagName("body")[0], 'mouseleave');
            this.dragEventMouseLeaveSubscription$ = this.dragEventMouseLeave$.subscribe(() => {
              this.dragEventSubscription$ && this.dragEventSubscription$.unsubscribe();
              this.dragEndEventSubscription$ && this.dragEndEventSubscription$.unsubscribe();
              this.dragEventSubscription$ = null;
              this.dragEndEventSubscription$ = null;
            });
            this.dragEndEvent$ = fromEvent(document.getElementsByTagName('body')[0], 'mouseup');
            this.dragEvent$ = fromEvent(document.getElementsByTagName("body")[0], 'mousemove').pipe(takeUntil(this.dragEndEvent$));
            this.dragEndEventSubscription$ = this.dragEndEvent$.subscribe(() => {
              this.dragEventSubscription$ && this.dragEventSubscription$.unsubscribe();
              this.dragEndEventSubscription$ && this.dragEndEventSubscription$.unsubscribe();
              this.dragEventSubscription$ = null;
              this.dragEndEventSubscription$ = null;
            });
            this.dragEventSubscription$ = this.dragEvent$.subscribe(res => {
              if (this.direction === 'row') {
                if (res['client' + d] - e['client' + d] >= this.toolbarLength - currentProcess / 100 * this.toolbarLength) {
                  this.adjustProcessByValue(100);
                } else if (res['client' + d] - e['client' + d] <= -(currentProcess / 100 * this.toolbarLength)) {
                  this.adjustProcessByValue(0);
                } else {
                  const value = Math.floor(currentProcess + ((res['client' + d] - e['client' + d]) / ( this.toolbarLength / 100)));
                  this.adjustProcessByValue(value);
                }
              } else if (this.direction === 'column') {
                if (e['client' + d] - res['client' + d] >= this.toolbarLength - currentProcess / 100 * this.toolbarLength) {
                  this.adjustProcessByValue(100);
                } else if (e['client' + d] - res['client' + d] <= -(currentProcess / 100 * this.toolbarLength)) {
                  this.adjustProcessByValue(0);
                } else {
                  const value = Math.floor(currentProcess + ((e['client' + d] - res['client' + d]) / ( this.toolbarLength / 100)));
                  this.adjustProcessByValue(value);
                }
              }
            });
          } else if (by === 'click') {
            if (e.target.className === 'current-process') {
              return;
            }
            if (this.direction === 'row') {
              this.localProcess = Math.floor((e['offset' + d] / this.toolbarLength) * 100);
              this.$emit('processChange', this.localProcess);
            } else if (this.direction === 'column') {
              this.localProcess = Math.floor((1 - e['offset' + d] / this.toolbarLength) * 100);
              this.$emit('processChange', this.localProcess);
            }
          }
        },
        adjustProcessByValue(value) {
          this.localProcess = value;
          this.$emit('processChange', this.localProcess);
        }
      },
      props: ['process', 'direction', 'toolbarLength'],
      watch: {
        process: {
          handler(val) {
            this.localProcess = val;
          }
        }
      }
    }
</script>

<style scoped lang="scss">
  .process-tool-bar-content{
    height: 100%;
    width: 100%;
  }
  .process-tool-bar-content.row-y{
    @include flex(column, unset, center);
  }
  .process-tool-bar-content.row-x{
    @include flex(row, unset, center);
  }
  .process-tool-bar-row {
    width: $max;
    height: 17px;
    @include flex(row, unset, center);
    :hover{
      cursor: pointer;
    }
    .current-process {
      width: 10px;
      height: 10px;
      background-color: $blue;
      border-radius: 10px;
    }

    .process-percent {
      background-color: $blue;
      height: 3px;
      width: $max;
      pointer-events: none;
    }
  }
  .process-tool-bar-column {
    height: $max;
    width: 17px;
    @include flex(column, unset, center);
    :hover{
      cursor: pointer;
    }
    .current-process {
      width: 10px;
      height: 10px;
      background-color: $blue;
      border-radius: 10px;
    }

    .process-percent {
      background-color: $blue;
      width: 3px;
      height: $max;
      pointer-events: none;
    }
  }
</style>
