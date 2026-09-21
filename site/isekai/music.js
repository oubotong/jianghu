(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.IsekaiMusic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const battleTracks={slime:'battle-normal',hakimi:'battle-hakimi',baller:'battle-court',ultraman:'battle-giant',kaiju:'battle-giant',clerk:'battle-guild',demon:'battle-demon',goddess:'battle-goddess'};
function trackFor(state){return state?.phase==='battle'?(battleTracks[state.battle?.id]||'battle-normal'):'event';}
class Player{
 constructor(assets,onError=()=>{}){this.assets=assets.music;this.onError=onError;this.context=null;this.master=null;this.current=null;this.voices=new Set();this.buffers=new Map();this.pending=null;this.muted=true;this.hidden=typeof document!=='undefined'&&document.hidden;this.wanted='event';this.revision=0;}
 ensure(){if(this.context)return true;const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;this.context=new Audio({sampleRate:44100});this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);return true;}
 unlock(){if(this.muted||this.hidden||!this.ensure())return;this.master.gain.setValueAtTime(.32,this.context.currentTime);this.context.resume().then(()=>this.sync()).catch(()=>{});this.sync();}
 cancel(){this.revision++;if(this.pending){this.pending.controller.abort();this.pending=null;}}
 setScene(state){const next=trackFor(state);if(next!==this.wanted){this.wanted=next;this.cancel();}this.sync();}
 setMuted(value){const next=!!value;if(next===this.muted)return;this.muted=next;if(next)this.pause();else this.unlock();}
 setHidden(value){const next=!!value;if(next===this.hidden)return;this.hidden=next;if(next)this.pause();else this.unlock();}
 pause(){this.cancel();if(!this.context)return;this.master.gain.setValueAtTime(0,this.context.currentTime);this.context.suspend().then(()=>{if(!this.muted&&!this.hidden)this.unlock();}).catch(()=>{});}
 async sync(){if(this.muted||this.hidden||!this.context||this.current?.key===this.wanted||this.pending?.key===this.wanted)return;const key=this.wanted,entry=this.assets[key];if(!entry)return;const revision=this.revision,controller=new AbortController(),request={key,controller};this.pending=request;
  try{let buffer=this.buffers.get(key);if(!buffer){const response=await fetch(entry.src,{signal:controller.signal});if(!response.ok)throw Error('Music HTTP '+response.status);const data=await response.arrayBuffer();if(controller.signal.aborted)return;buffer=await this.context.decodeAudioData(data);}
   if(this.pending!==request||revision!==this.revision||this.muted||this.hidden||key!==this.wanted)return;
   this.buffers.delete(key);this.buffers.set(key,buffer);while(this.buffers.size>2)this.buffers.delete(this.buffers.keys().next().value);
   this.play(key,buffer,entry);
  }catch(error){if(error.name!=='AbortError'&&revision===this.revision&&!this.muted&&!this.hidden)this.onError(key,error);}
  finally{if(this.pending===request)this.pending=null;}
 }
 play(key,buffer,entry){const ctx=this.context,now=ctx.currentTime;
  // Only the outgoing and incoming track overlap; rapid navigation cannot stack music.
  for(const voice of this.voices)if(voice!==this.current){try{voice.source.stop();}catch{}voice.gain.disconnect();this.voices.delete(voice);}
  const old=this.current,source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=Math.min(buffer.duration,entry.duration);source.connect(gain);gain.connect(this.master);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,now+.4);const voice={key,source,gain};this.current=voice;this.voices.add(voice);source.onended=()=>{gain.disconnect();source.disconnect();this.voices.delete(voice);};source.start(now);
  if(old){old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(old.gain.gain.value,now);old.gain.gain.linearRampToValueAtTime(0,now+.4);try{old.source.stop(now+.42);}catch{}}
 }
 destroy(){this.cancel();for(const voice of this.voices){try{voice.source.stop();}catch{}voice.gain.disconnect();}this.voices.clear();this.buffers.clear();this.current=null;this.context?.close().catch(()=>{});}
}
return {trackFor,battleTracks,Player};
});
