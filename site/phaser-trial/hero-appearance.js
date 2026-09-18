/* Character appearance is presentation only; existing saves retain their gender. */
(()=>{'use strict';
 const female=()=>typeof S!=='undefined'&&S.gender==='女';
 window.playerHeroAtlas=()=>female()?window.CLASSIC_FEMALE_ATLASES:window.CLASSIC_HERO_ATLASES;
 window.playerHeroPortrait=()=>`phaser-trial/${female()?'hero-female-v1':'hero-v2'}/portrait.webp`;
 const originalPoses=heroPoses,originalMartial=martialAtlas,originalClaw=setClawFrame,originalSetPose=setHeroPose;
 heroPoses=function(){return female()&&window.FEMALE_HERO_POSES?window.FEMALE_HERO_POSES:originalPoses.apply(this,arguments);};
 martialAtlas=function(style){return female()&&window.CLASSIC_FEMALE_ATLASES?.[style]||originalMartial.apply(this,arguments);};
 setClawFrame=function(frame){if(female()&&window.CLASSIC_FEMALE_ATLASES?.claw)return setMartialFrame('claw',frame);return originalClaw.apply(this,arguments);};
 setHeroPose=function(){const result=originalSetPose.apply(this,arguments);if(female()){const image=document.querySelector('#stage-p img.hero-img');if(image)image.style.height='100%';}return result;};
 // Demo selection never alters a real playthrough or a saved character.
 if(/(?:combat|companion)-preview(?:\.html)?\/?$/.test(location.pathname)&&new URLSearchParams(location.search).get('gender')==='female'&&typeof S!=='undefined'){
  S.gender='女';const image=document.querySelector('#stage-p img.hero-img');if(image)image.src=heroPoses()[0];
 }
})();
