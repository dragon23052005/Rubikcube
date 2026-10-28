import{B as be,b as C,c as We,d as ze,e as Qe,f as He,g as Te,h as F,i as Ae,j as B,k as p,l as Z,m as f,n as $,o as Se,p as b,q as E,r as P,s as te,t as Ye,u as _e,w as Ge,x as V,y as Ze,z as $e}from"./chunks/chunk-TT7JMKR4.js";import{c as Xe,d as Je,i as Ke,j as et,k as tt,p as rt,q as nt,r as it,s as at,w as st}from"./chunks/chunk-36P6YPDR.js";import{a as O,b as Ve,c as Ue,e as oe,f as le,g as Me,h as ye,i as ce,j,k as _,m as A,n as G,o as qe,p as xe,q as ee,r as N,s as S,t as z}from"./chunks/chunk-R6RLDTUT.js";var lr=class extends N{traverseAlg(e){let t=0;for(let r of e.childAlgNodes())t+=this.traverseAlgNode(r);return t}traverseGrouping(e){return this.traverseAlg(e.alg)*Math.abs(e.amount)}traverseMove(e){return 1}traverseCommutator(e){return 2*(this.traverseAlg(e.A)+this.traverseAlg(e.B))}traverseConjugate(e){return 2*this.traverseAlg(e.A)+this.traverseAlg(e.B)}traversePause(e){return 1}traverseNewline(e){return 0}traverseLineComment(e){return 0}},ot=S(lr),v={OuterBlockTurnMetric:"OBTM",RangeBlockTurnMetric:"RBTM",SingleSliceTurnMetric:"SSTM",OuterBlockQuantumTurnMetric:"OBQTM",RangeBlockQuantumTurnMetric:"RBQTM",SingleSliceQuantumTurnMetric:"SSQTM",ExecutionTurnMetric:"ETM"};var y={Rotation:"Rotation",Outer:"Outer",Inner:"Inner"};function cr(e){return e.endsWith("v")||["x","y","z"].includes(e)?y.Rotation:e.startsWith("2")||["M","E","S"].includes(e)?y.Inner:y.Outer}var re;function ur(){if(re)return re;re={};let e=[...Object.keys(ze.moves),...Object.keys(ze.derivedMoves)];for(let t of e)re[t]=cr(t);return re}var lt={[v.OuterBlockTurnMetric]:{[y.Rotation]:{constantFactor:0,amountFactor:0,zeroAmount:0},[y.Outer]:{constantFactor:1,amountFactor:0,zeroAmount:0},[y.Inner]:{constantFactor:2,amountFactor:0,zeroAmount:0}},[v.RangeBlockTurnMetric]:{[y.Rotation]:{constantFactor:0,amountFactor:0,zeroAmount:0},[y.Outer]:{constantFactor:1,amountFactor:0,zeroAmount:0},[y.Inner]:{constantFactor:1,amountFactor:0,zeroAmount:0}},[v.OuterBlockQuantumTurnMetric]:{[y.Rotation]:{constantFactor:0,amountFactor:0,zeroAmount:0},[y.Outer]:{constantFactor:0,amountFactor:1,zeroAmount:0},[y.Inner]:{constantFactor:0,amountFactor:2,zeroAmount:0}},[v.RangeBlockQuantumTurnMetric]:{[y.Rotation]:{constantFactor:0,amountFactor:0,zeroAmount:0},[y.Outer]:{constantFactor:0,amountFactor:1,zeroAmount:0},[y.Inner]:{constantFactor:0,amountFactor:1,zeroAmount:0}},[v.ExecutionTurnMetric]:{[y.Rotation]:{constantFactor:1,amountFactor:0,zeroAmount:1},[y.Outer]:{constantFactor:1,amountFactor:0,zeroAmount:1},[y.Inner]:{constantFactor:1,amountFactor:0,zeroAmount:1}}};function dr(e,t){let r=lt[e];if(!r)throw new Error(`Invalid metric for 3x3x3: ${e}`);let n=ur(),i=t.quantum.toString();if(!(i in n))throw new Error(`Invalid move for 3x3x3 ${e}: ${i}`);let a=n[i],{constantFactor:s,amountFactor:l,zeroAmount:c}=r[a];return t.amount===0?c:s+l*Math.abs(t.amount)}var ne=class extends N{metric;constructor(e){super(),this.metric=e}traverseAlg(e){let t=0;for(let r of e.childAlgNodes())t+=this.traverseAlgNode(r);return t}traverseGrouping(e){let t=e.alg;return this.traverseAlg(t)*Math.abs(e.amount)}traverseMove(e){return this.metric(e)}traverseCommutator(e){return 2*(this.traverseAlg(e.A)+this.traverseAlg(e.B))}traverseConjugate(e){return 2*this.traverseAlg(e.A)+this.traverseAlg(e.B)}traversePause(e){return 0}traverseNewline(e){return 0}traverseLineComment(e){return 0}},hr=class extends N{traverseAlg(e){let t=0;for(let r of e.childAlgNodes())t+=this.traverseAlgNode(r);return t}traverseGrouping(e){let t=e.alg;return this.traverseAlg(t)*Math.abs(e.amount)}traverseMove(e){return 1}traverseCommutator(e){return 2*(this.traverseAlg(e.A)+this.traverseAlg(e.B))}traverseConjugate(e){return 2*this.traverseAlg(e.A)+this.traverseAlg(e.B)}traversePause(e){return 1}traverseNewline(e){return 1}traverseLineComment(e){return 1}};function ct(e){return"A"<=e&&e<="Z"}function mr(e){let t=e.family;return ct(t[0])&&t[t.length-1]==="v"||t==="x"||t==="y"||t==="z"||t==="T"?0:1}function pr(e){return 1}function ut(e){let t=e.family;return ct(t[0])&&t[t.length-1]==="v"||t==="x"||t==="y"||t==="z"||t==="T"?0:1}function gr(e){return Math.abs(e.amount)*ut(e)}var ra=S(ne,[mr]),fr=S(ne,[pr]),vr=S(ne,[gr]),wr=S(ne,[ut]),dt=S(hr,[]);function ht(e,t,r){if(e.id==="3x3x3"){if(t in lt)return S(ne,[n=>dr(t,n)])(r)}else switch(t){case v.ExecutionTurnMetric:return fr(r);case v.RangeBlockTurnMetric:{if(e.pg)return wr(r);break}case v.RangeBlockQuantumTurnMetric:{if(e.pg)return vr(r);break}}throw new Error("Unsupported puzzle or metric.")}function U(e){switch(Math.abs(e)){case 0:return 0;case 1:return 1e3;case 2:return 1500;default:return 2e3}}var Nt=class extends N{durationForAmount=U;constructor(e=U){super(),this.durationForAmount=e}traverseAlg(e){let t=0;for(let r of e.childAlgNodes())t+=this.traverseAlgNode(r);return t}traverseGrouping(e){return e.amount*this.traverseAlg(e.alg)}traverseMove(e){return this.durationForAmount(e.amount)}traverseCommutator(e){return 2*(this.traverseAlg(e.A)+this.traverseAlg(e.B))}traverseConjugate(e){return 2*this.traverseAlg(e.A)+this.traverseAlg(e.B)}traversePause(e){return this.durationForAmount(1)}traverseNewline(e){return this.durationForAmount(1)}traverseLineComment(e){return this.durationForAmount(0)}},Mr=class{moves;durationFn=new Nt(U);kpuzzle;constructor(e,t){this.kpuzzle=e,this.moves=new z(t.experimentalExpand())}getAnimLeaf(e){return Array.from(this.moves.childAlgNodes())[e]}indexToMoveStartTimestamp(e){let t=new z(Array.from(this.moves.childAlgNodes()).slice(0,e));return this.durationFn.traverseAlg(t)}timestampToIndex(e){let t=0,r;for(r=0;r<this.numAnimatedLeaves();r++)if(t+=this.durationFn.traverseMove(this.getAnimLeaf(r)),t>=e)return r;return r}patternAtIndex(e){return this.kpuzzle.defaultPattern().applyTransformation(this.transformationAtIndex(e))}transformationAtIndex(e){let t=this.kpuzzle.identityTransformation();for(let r of Array.from(this.moves.childAlgNodes()).slice(0,e))t=t.applyMove(r);return t}algDuration(){return this.durationFn.traverseAlg(this.moves)}numAnimatedLeaves(){return ot(this.moves)}moveDuration(e){return this.durationFn.traverseMove(this.getAnimLeaf(e))}},H=class{moveCount;duration;forward;backward;children=[];constructor(e,t,r,n,i=[]){this.moveCount=e,this.duration=t,this.forward=r,this.backward=n,this.children=i}},yr=class extends N{identity;dummyLeaf;durationFn=new Nt(U);cache={};kpuzzle;constructor(e){super(),this.kpuzzle=e,this.identity=e.identityTransformation(),this.dummyLeaf=new H(0,0,this.identity,this.identity,[])}traverseAlg(e){let t=0,r=0,n=this.identity,i=[];for(let a of e.childAlgNodes()){let s=this.traverseAlgNode(a);t+=s.moveCount,r+=s.duration,n===this.identity?n=s.forward:n=n.applyTransformation(s.forward),i.push(s)}return new H(t,r,n,n.invert(),i)}traverseGrouping(e){let t=this.traverseAlg(e.alg);return this.mult(t,e.amount,[t])}traverseMove(e){let t=e.toString(),r=this.cache[t];if(r)return r;let n=this.kpuzzle.moveToTransformation(e);return r=new H(1,this.durationFn.traverseAlgNode(e),n,n.invert()),this.cache[t]=r,r}traverseCommutator(e){let t=this.traverseAlg(e.A),r=this.traverseAlg(e.B),n=t.forward.applyTransformation(r.forward),i=t.backward.applyTransformation(r.backward),a=n.applyTransformation(i),s=new H(2*(t.moveCount+r.moveCount),2*(t.duration+r.duration),a,a.invert(),[t,r]);return this.mult(s,1,[s,t,r])}traverseConjugate(e){let t=this.traverseAlg(e.A),r=this.traverseAlg(e.B),i=t.forward.applyTransformation(r.forward).applyTransformation(t.backward),a=new H(2*t.moveCount+r.moveCount,2*t.duration+r.duration,i,i.invert(),[t,r]);return this.mult(a,1,[a,t,r])}traversePause(e){return e.experimentalNISSGrouping?this.dummyLeaf:new H(1,this.durationFn.traverseAlgNode(e),this.identity,this.identity)}traverseNewline(e){return this.dummyLeaf}traverseLineComment(e){return this.dummyLeaf}mult(e,t,r){let n=Math.abs(t),i=e.forward.selfMultiply(t);return new H(e.moveCount*n,e.duration*n,i,i.invert(),r)}},x=class{apd;back;constructor(e,t){this.apd=e,this.back=t}},xr=class extends ee{move;moveDuration;back;st;root;i;dur;goalIndex;goalDuration;kpuzzle;algOrAlgNode;apd;constructor(e,t,r){super(),this.kpuzzle=e,this.algOrAlgNode=t,this.apd=r,this.i=-1,this.dur=-1,this.goalIndex=-1,this.goalDuration=-1,this.move=void 0,this.back=!1,this.moveDuration=0,this.st=this.kpuzzle.identityTransformation(),this.root=new x(this.apd,!1)}moveByIndex(e){return this.i>=0&&this.i===e?this.move!==void 0:this.dosearch(e,1/0)}moveByDuration(e){return this.dur>=0&&this.dur<e&&this.dur+this.moveDuration>=e?this.move!==void 0:this.dosearch(1/0,e)}dosearch(e,t){return this.goalIndex=e,this.goalDuration=t,this.i=0,this.dur=0,this.move=void 0,this.moveDuration=0,this.back=!1,this.st=this.kpuzzle.identityTransformation(),this.algOrAlgNode.is(z)?this.traverseAlg(this.algOrAlgNode,this.root):this.traverseAlgNode(this.algOrAlgNode,this.root)}traverseAlg(e,t){if(!this.firstcheck(t))return!1;let r=t.back?e.experimentalNumChildAlgNodes()-1:0;for(let n of Ue(e.childAlgNodes(),t.back?O.Backwards:O.Forwards)){if(this.traverseAlgNode(n,new x(t.apd.children[r],t.back)))return!0;r+=t.back?-1:1}return!1}traverseGrouping(e,t){if(!this.firstcheck(t))return!1;let r=this.domult(t,e.amount);return this.traverseAlg(e.alg,new x(t.apd.children[0],r))}traverseMove(e,t){return this.firstcheck(t)?(this.move=e,this.moveDuration=t.apd.duration,this.back=t.back,!0):!1}traverseCommutator(e,t){if(!this.firstcheck(t))return!1;let r=this.domult(t,1);return r?this.traverseAlg(e.B,new x(t.apd.children[2],!r))||this.traverseAlg(e.A,new x(t.apd.children[1],!r))||this.traverseAlg(e.B,new x(t.apd.children[2],r))||this.traverseAlg(e.A,new x(t.apd.children[1],r)):this.traverseAlg(e.A,new x(t.apd.children[1],r))||this.traverseAlg(e.B,new x(t.apd.children[2],r))||this.traverseAlg(e.A,new x(t.apd.children[1],!r))||this.traverseAlg(e.B,new x(t.apd.children[2],!r))}traverseConjugate(e,t){if(!this.firstcheck(t))return!1;let r=this.domult(t,1);return r?this.traverseAlg(e.A,new x(t.apd.children[1],!r))||this.traverseAlg(e.B,new x(t.apd.children[2],r))||this.traverseAlg(e.A,new x(t.apd.children[1],r)):this.traverseAlg(e.A,new x(t.apd.children[1],r))||this.traverseAlg(e.B,new x(t.apd.children[2],r))||this.traverseAlg(e.A,new x(t.apd.children[1],!r))}traversePause(e,t){return this.firstcheck(t)?(this.move=e,this.moveDuration=t.apd.duration,this.back=t.back,!0):!1}traverseNewline(e,t){return!1}traverseLineComment(e,t){return!1}firstcheck(e){return e.apd.moveCount+this.i<=this.goalIndex&&e.apd.duration+this.dur<this.goalDuration?this.keepgoing(e):!0}domult(e,t){let r=e.back;if(t===0)return r;t<0&&(r=!r,t=-t);let n=e.apd.children[0],i=Math.min(Math.floor((this.goalIndex-this.i)/n.moveCount),Math.ceil((this.goalDuration-this.dur)/n.duration-1));return i>0&&this.keepgoing(new x(n,r),i),r}keepgoing(e,t=1){return this.i+=t*e.apd.moveCount,this.dur+=t*e.apd.duration,t!==1?e.back?this.st=this.st.applyTransformation(e.apd.backward.selfMultiply(t)):this.st=this.st.applyTransformation(e.apd.forward.selfMultiply(t)):e.back?this.st=this.st.applyTransformation(e.apd.backward):this.st=this.st.applyTransformation(e.apd.forward),!1}},zr=16;function Tr(e,t){let r=new le,n=new le;for(let i of e.childAlgNodes())n.push(i),n.experimentalNumAlgNodes()>=t&&(r.push(new G(n.toAlg())),n.reset());return r.push(new G(n.toAlg())),r.toAlg()}var Ar=class extends N{traverseAlg(e){let t=e.experimentalNumChildAlgNodes();return t<zr?e:Tr(e,Math.ceil(Math.sqrt(t)))}traverseGrouping(e){return new G(this.traverseAlg(e.alg),e.amount)}traverseMove(e){return e}traverseCommutator(e){return new oe(this.traverseAlg(e.A),this.traverseAlg(e.B))}traverseConjugate(e){return new oe(this.traverseAlg(e.A),this.traverseAlg(e.B))}traversePause(e){return e}traverseNewline(e){return e}traverseLineComment(e){return e}},Sr=S(Ar),mt=class{decoration;walker;kpuzzle;constructor(e,t){this.kpuzzle=e;let r=new yr(this.kpuzzle),n=Sr(t);this.decoration=r.traverseAlg(n),this.walker=new xr(this.kpuzzle,n,this.decoration)}getAnimLeaf(e){if(this.walker.moveByIndex(e)){if(!this.walker.move)throw new Error("`this.walker.mv` missing");let t=this.walker.move;return this.walker.back?t.invert():t}return null}indexToMoveStartTimestamp(e){if(this.walker.moveByIndex(e)||this.walker.i===e)return this.walker.dur;throw new Error(`Out of algorithm: index ${e}`)}indexToMovesInProgress(e){if(this.walker.moveByIndex(e)||this.walker.i===e)return this.walker.dur;throw new Error(`Out of algorithm: index ${e}`)}patternAtIndex(e,t){return this.walker.moveByIndex(e),(t??this.kpuzzle.defaultPattern()).applyTransformation(this.walker.st)}transformationAtIndex(e){return this.walker.moveByIndex(e),this.walker.st}numAnimatedLeaves(){return this.decoration.moveCount}timestampToIndex(e){return this.walker.moveByDuration(e),this.walker.i}algDuration(){return this.decoration.duration}moveDuration(e){return this.walker.moveByIndex(e),this.walker.moveDuration}};var br=class extends p{getDefaultValue(){return"auto"}},ue="http://www.w3.org/2000/svg",pt="data-copy-id",gt=0;function kr(){return gt+=1,`svg${gt.toString()}`}var Ir={dim:{white:"#dddddd",orange:"#884400",limegreen:"#008800",red:"#660000","rgb(34, 102, 255)":"#000088",yellow:"#888800","rgb(102, 0, 153)":"rgb(50, 0, 76)",purple:"#3f003f"},oriented:"#44ddcc",ignored:"#555555",invisible:"#00000000"},Lr=class{wrapperElement;svgElement;gradientDefs;originalColors={};gradients={};svgID;kpuzzle;showUnknownOrientations=!1;constructor(e,t,r,n=!1){if(this.kpuzzle=e,this.showUnknownOrientations=n,!t)throw new Error(`No SVG definition for puzzle type: ${e.name()}`);this.svgID=kr(),this.wrapperElement=document.createElement("div"),this.wrapperElement.classList.add("svg-wrapper"),this.wrapperElement.innerHTML=t;let i=this.wrapperElement.querySelector("svg");if(!i)throw new Error("Could not get SVG element");if(this.svgElement=i,ue!==i.namespaceURI)throw new Error("Unexpected XML namespace");i.style.maxWidth="100%",i.style.maxHeight="100%",this.gradientDefs=document.createElementNS(ue,"defs"),i.insertBefore(this.gradientDefs,i.firstChild);for(let a of e.definition.orbits)for(let s=0;s<a.numPieces;s++)for(let l=0;l<a.numOrientations;l++){let c=this.elementID(a.orbitName,s,l),o=this.elementByID(c),d=o?.style.fill;r?(()=>{let u=r.orbits;if(!u)return;let h=u[a.orbitName];if(!h)return;let g=h.pieces[s];if(!g)return;let M=g.facelets[l];if(!M)return;let I=typeof M=="string"?M:M?.mask,T=Ir[I];typeof T=="string"?d=T:T&&(d=T[d])})():d=o?.style.fill,this.originalColors[c]=d,this.gradients[c]=this.newGradient(c,d),this.gradientDefs.appendChild(this.gradients[c]),o?.setAttribute("style",`fill: url(#grad-${this.svgID}-${c})`)}for(let a of Array.from(i.querySelectorAll(`[${pt}]`))){let s=a.getAttribute(pt);a.setAttribute("style",`fill: url(#grad-${this.svgID}-${s})`)}this.showUnknownOrientations&&this.drawPattern(this.kpuzzle.defaultPattern())}drawPattern(e,t,r){this.draw(e,t,r)}draw(e,t,r){let n=t?.experimentalToTransformation();if(!e)throw new Error("Distinguishable pieces are not handled for SVG yet!");for(let i of e.kpuzzle.definition.orbits){let a=e.patternData[i.orbitName],s=n?n.transformationData[i.orbitName]:null;for(let l=0;l<i.numPieces;l++)for(let c=0;c<i.numOrientations;c++){let o=this.elementID(i.orbitName,l,c),d=this.elementID(i.orbitName,a.pieces[l],(i.numOrientations-a.orientation[l]+c)%i.numOrientations),u=!1;if(s){let h=this.elementID(i.orbitName,s.permutation[l],(i.numOrientations-s.orientationDelta[l]+c)%i.numOrientations);d===h&&(u=!0),r=r||0;let g=100*(1-r*r*(2-r*r));this.gradients[o].children[0].setAttribute("stop-color",this.originalColors[d]),this.gradients[o].children[0].setAttribute("offset",`${Math.max(g-5,0)}%`),this.gradients[o].children[1].setAttribute("offset",`${Math.max(g-5,0)}%`),this.gradients[o].children[2].setAttribute("offset",`${g}%`),this.gradients[o].children[3].setAttribute("offset",`${g}%`),this.gradients[o].children[3].setAttribute("stop-color",this.originalColors[h])}else u=!0;u&&(this.showUnknownOrientations&&a.orientationMod?.[l]===1?(this.gradients[o].children[0].setAttribute("stop-color","#000"),this.gradients[o].children[0].setAttribute("offset","5%"),this.gradients[o].children[1].setAttribute("offset","5%"),this.gradients[o].children[2].setAttribute("offset","20%"),this.gradients[o].children[3].setAttribute("offset","20%"),this.gradients[o].children[3].setAttribute("stop-color",this.originalColors[d])):(this.gradients[o].children[0].setAttribute("stop-color",this.originalColors[d]),this.gradients[o].children[0].setAttribute("offset","100%"),this.gradients[o].children[1].setAttribute("offset","100%"),this.gradients[o].children[2].setAttribute("offset","100%"),this.gradients[o].children[3].setAttribute("offset","100%")))}}}newGradient(e,t){let r=document.createElementNS(ue,"radialGradient");r.setAttribute("id",`grad-${this.svgID}-${e}`),r.setAttribute("r","70.7107%");let n=[{offset:0,color:t},{offset:0,color:"black"},{offset:0,color:"black"},{offset:0,color:t}];for(let i of n){let a=document.createElementNS(ue,"stop");a.setAttribute("offset",`${i.offset}%`),a.setAttribute("stop-color",i.color),a.setAttribute("stop-opacity","1"),r.appendChild(a)}return r}elementID(e,t,r){return`${e}-l${t}-o${r}`}elementByID(e){return this.wrapperElement.querySelector(`#${e}`)}},ae=class{#e=null;elem;prefix;validSuffixes;constructor(e,t,r){this.elem=e,this.prefix=t,this.validSuffixes=r}clearValue(){this.#e&&this.elem.contentWrapper.classList.remove(this.#e),this.#e=null}setValue(e){if(!this.validSuffixes.includes(e))throw new Error(`Invalid suffix: ${e}`);let t=`${this.prefix}${e}`,r=this.#e!==t;return r&&(this.clearValue(),this.elem.contentWrapper.classList.add(t),this.#e=t),r}};function Ce(e,t){if(e===t)return!0;if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}function ft(e,t,r){if(e===t)return!0;if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(!r(e[n],t[n]))return!1;return!0}function Ee(e,t,r){return qe(e,r-t,t)}var k={Forwards:1,Paused:0,Backwards:-1};var q={Move:"move",EntireTimeline:"entire-timeline"},Dr=class{catchingUp=!1;pendingFrame=!1;tempoScale=1;model;constructor(e){this.model=e,e.tempoScale.addFreshListener(t=>{this.tempoScale=t})}scheduler=new te(this.animFrame.bind(this));start(){this.catchingUp||(this.lastTimestamp=performance.now()),this.catchingUp=!0,this.pendingFrame=!0,this.scheduler.requestAnimFrame()}stop(){this.catchingUp=!1,this.scheduler.cancelAnimFrame()}catchUpMs=500;lastTimestamp=0;animFrame(e){this.scheduler.requestAnimFrame();let t=this.tempoScale*(e-this.lastTimestamp)/this.catchUpMs;this.lastTimestamp=e,this.model.catchUpMove.set((async()=>{let r=await this.model.catchUpMove.get();if(r.move===null)return r;let n=r.amount+t;return n>=1?(this.pendingFrame=!0,this.stop(),this.model.timestampRequest.set("end"),{move:null,amount:0}):(this.pendingFrame=!1,{move:r.move,amount:n})})())}},Cr=class{playing=!1;direction=k.Forwards;catchUpHelper;model;lastDatestamp=0;lastTimestampPromise;scheduler=new te(this.animFrame.bind(this));delegate;constructor(e,t){this.delegate=t,this.model=e,this.lastTimestampPromise=this.#e(),this.model.playingInfo.addFreshListener(this.onPlayingProp.bind(this)),this.catchUpHelper=new Dr(this.model),this.model.catchUpMove.addFreshListener(this.onCatchUpMoveProp.bind(this))}async onPlayingProp(e){e.playing!==this.playing&&(e.playing?this.play(e):this.pause())}async onCatchUpMoveProp(e){let t=e.move!==null;t!==this.catchUpHelper.catchingUp&&(t?this.catchUpHelper.start():this.catchUpHelper.stop()),this.scheduler.requestAnimFrame()}async#e(){return(await this.model.detailedTimelineInfo.get()).timestamp}jumpToStart(e){this.model.timestampRequest.set("start"),this.pause(),e?.flash&&this.delegate.flash()}jumpToEnd(e){this.model.timestampRequest.set("end"),this.pause(),e?.flash&&this.delegate.flash()}playPause(){this.playing?this.pause():this.play()}play(e){(async()=>{let t=e?.direction??k.Forwards,r=await this.model.coarseTimelineInfo.get();(e?.autoSkipToOtherEndIfStartingAtBoundary??!0)&&(t===k.Forwards&&r.atEnd&&(this.model.timestampRequest.set("start"),this.delegate.flash()),t===k.Backwards&&r.atStart&&(this.model.timestampRequest.set("end"),this.delegate.flash())),this.model.playingInfo.set({playing:!0,direction:t,untilBoundary:e?.untilBoundary??q.EntireTimeline,loop:e?.loop??!1}),this.playing=!0,this.lastDatestamp=performance.now(),this.lastTimestampPromise=this.#e(),this.scheduler.requestAnimFrame()})()}pause(){this.playing=!1,this.scheduler.cancelAnimFrame(),this.model.playingInfo.set({playing:!1,untilBoundary:q.EntireTimeline})}#r=new Ae;async animFrame(e){this.playing&&this.scheduler.requestAnimFrame();let t=this.lastDatestamp,r=await this.#r.queue(Promise.all([this.model.playingInfo.get(),this.lastTimestampPromise,this.model.timeRange.get(),this.model.tempoScale.get(),this.model.currentMoveInfo.get()])),[n,i,a,s,l]=r;if(!n.playing){this.playing=!1;return}let c=l.earliestEnd;(l.currentMoves.length===0||n.untilBoundary===q.EntireTimeline)&&(c=a.end);let o=l.latestStart;(l.currentMoves.length===0||n.untilBoundary===q.EntireTimeline)&&(o=a.start);let d=(e-t)*this.direction*s;d=Math.max(d,1),d*=n.direction;let u=i+d,h=null;u>=c?n.loop?u=Ee(u,a.start,a.end):(u===a.end?h="end":u=c,this.playing=!1,this.model.playingInfo.set({playing:!1})):u<=o&&(n.loop?u=Ee(u,a.start,a.end):(u===a.start?h="start":u=o,this.playing=!1,this.model.playingInfo.set({playing:!1}))),this.lastDatestamp=e,this.lastTimestampPromise=Promise.resolve(u),this.model.timestampRequest.set(h??u)}},Er=class{animationController;model;constructor(e,t){this.model=e,this.animationController=new Cr(e,t)}jumpToStart(e){this.animationController.jumpToStart(e)}jumpToEnd(e){this.animationController.jumpToEnd(e)}togglePlay(e){typeof e>"u"&&this.animationController.playPause(),e?this.animationController.play():this.animationController.pause()}async visitTwizzleLink(){let e=document.createElement("a");e.href=await this.model.twizzleLink(),e.target="_blank",e.click()}},Pr={"bottom-row":!0,none:!0},Nr=class extends p{getDefaultValue(){return"auto"}},Oe=new E;Oe.replaceSync(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

.wrapper > * {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper.back-view-side-by-side {
  grid-template-columns: 1fr 1fr;
}

.wrapper.back-view-top-right {
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 3fr;
}

.wrapper.back-view-top-right > :nth-child(1) {
  grid-row: 1 / 3;
  grid-column: 1 / 3;
}

.wrapper.back-view-top-right > :nth-child(2) {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
}
`);var Rt=new E;Rt.replaceSync(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
}

.svg-wrapper,
twisty-2d-svg,
svg {
  width: 100%;
  height: 100%;
  display: grid;
  min-height: 0;
}

svg {
  animation: fade-in 0.25s ease-in;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hint-facelets-none .hint-facelet {
  display: none;
}
`);var Ot=class extends P{svgWrapper;scheduler=new te(this.render.bind(this));#e=null;model;kpuzzle;svgSource;options;puzzleLoader;constructor(e,t,r,n,i){super(),this.model=e,this.kpuzzle=t,this.svgSource=r,this.options=n,this.addCSS(Rt),this.resetSVG(),this.#r.addListener(this.model.puzzleID,a=>{i?.id!==a&&this.disconnect()}),this.#r.addListener(this.model.twistySceneModel.hintFacelet,a=>{this.setHintFacelet(a)}),this.#r.addListener(this.model.legacyPosition,this.onPositionChange.bind(this)),this.options?.experimentalStickeringMask&&this.experimentalSetStickeringMask(this.options.experimentalStickeringMask)}#r=new $;disconnect(){this.#r.disconnect()}onPositionChange(e){try{if(e.movesInProgress.length>0){let t=e.movesInProgress[0].move,r=t;e.movesInProgress[0].direction===k.Backwards&&(r=t.invert());let n=e.pattern.applyMove(r);this.svgWrapper?.draw(e.pattern,n,e.movesInProgress[0].fraction)}else this.svgWrapper?.draw(e.pattern),this.#e=e}catch(t){console.warn("Bad position (this doesn't necessarily mean something is wrong). Pre-emptively disconnecting:",this.puzzleLoader?.id,t),this.disconnect()}}scheduleRender(){this.scheduler.requestAnimFrame()}experimentalSetStickeringMask(e){this.resetSVG(e)}resetSVG(e){this.svgWrapper&&this.removeElement(this.svgWrapper.wrapperElement),this.kpuzzle&&(this.svgWrapper=new Lr(this.kpuzzle,this.svgSource,e),this.addElement(this.svgWrapper.wrapperElement),this.#e&&this.onPositionChange(this.#e))}hintFaceletsClassListManager=new ae(this,"hint-facelets-",Object.keys(Ye));setHintFacelet(e){this.hintFaceletsClassListManager.setValue(e==="auto"?"floating":e)}render(){}};b.define("twisty-2d-puzzle",Ot);var Rr=class{model;schedulable;puzzleLoader;effectiveVisualization;constructor(e,t,r,n){this.model=e,this.schedulable=t,this.puzzleLoader=r,this.effectiveVisualization=n,this.twisty2DPuzzle(),this.#e.addListener(this.model.twistySceneModel.stickeringMask,async i=>{(await this.twisty2DPuzzle()).experimentalSetStickeringMask(i)})}#e=new $;disconnect(){this.#e.disconnect()}scheduleRender(){}#r=null;async twisty2DPuzzle(){return this.#r??=(async()=>{let e=this.effectiveVisualization==="experimental-2D-LL-face"?this.puzzleLoader.llFaceSVG():this.effectiveVisualization==="experimental-2D-LL"?this.puzzleLoader.llSVG():this.puzzleLoader.svg();return new Ot(this.model,await this.puzzleLoader.kpuzzle(),await e,{},this.puzzleLoader)})()}},Ft=class extends P{#e=new $;disconnect(){this.#e.disconnect()}model;effectiveVisualization;constructor(e,t){super(),this.model=e,this.effectiveVisualization=t}async connectedCallback(){this.addCSS(Oe),this.model&&this.#e.addListener(this.model.twistyPlayerModel.puzzleLoader,this.onPuzzleLoader.bind(this))}#r;async scene(){return this.#r??=(async()=>new(await V).ThreeScene)()}scheduleRender(){this.#t?.scheduleRender()}#t;currentTwisty2DPuzzleWrapper(){return this.#t}async setCurrentTwisty2DPuzzleWrapper(e){let t=this.#t;this.#t=e,t?.disconnect();let r=e.twisty2DPuzzle();this.contentWrapper.textContent="",this.addElement(await r)}async onPuzzleLoader(e){this.#t?.disconnect();let t=new Rr(this.model.twistyPlayerModel,this,e,this.effectiveVisualization);this.setCurrentTwisty2DPuzzleWrapper(t)}};b.define("twisty-2d-scene-wrapper",Ft);var jt=class{#e;reject;promise;constructor(){this.promise=new Promise((e,t)=>{this.#e=e,this.reject=t})}handleNewValue(e){this.#e(e)}},Bt=class extends EventTarget{model;schedulable;puzzleLoader;visualizationStrategy;constructor(e,t,r,n){super(),this.model=e,this.schedulable=t,this.puzzleLoader=r,this.visualizationStrategy=n,this.twisty3DPuzzle(),this.#e.addListener(this.model.puzzleLoader,i=>{this.puzzleLoader.id!==i.id&&this.disconnect()}),this.#e.addListener(this.model.legacyPosition,async i=>{try{(await this.twisty3DPuzzle()).onPositionChange(i),this.scheduleRender()}catch{this.disconnect()}}),this.#e.addListener(this.model.twistySceneModel.hintFacelet,async i=>{(await this.twisty3DPuzzle()).experimentalUpdateOptions({hintFacelets:i==="auto"?"floating":i}),this.scheduleRender()}),this.#e.addListener(this.model.twistySceneModel.foundationDisplay,async i=>{(await this.twisty3DPuzzle()).experimentalUpdateOptions({showFoundation:i!=="none"}),this.scheduleRender()}),this.#e.addListener(this.model.twistySceneModel.stickeringMask,async i=>{(await this.twisty3DPuzzle()).setStickeringMask(i),this.scheduleRender()}),this.#e.addListener(this.model.twistySceneModel.faceletScale,async i=>{(await this.twisty3DPuzzle()).experimentalUpdateOptions({faceletScale:i}),this.scheduleRender()}),this.#e.addListener(this.model.twistySceneModel.hintFaceletsElevation,async i=>{(await this.twisty3DPuzzle()).experimentalUpdateOptions({hintFaceletsElevation:i}),this.scheduleRender()}),this.#e.addMultiListener3([this.model.twistySceneModel.stickeringMask,this.model.twistySceneModel.foundationStickerSprite,this.model.twistySceneModel.hintStickerSprite],async i=>{"experimentalUpdateTexture"in await this.twisty3DPuzzle()&&((await this.twisty3DPuzzle()).experimentalUpdateTexture(i[0].specialBehaviour==="picture",i[1],i[2]),this.scheduleRender())})}#e=new $;disconnect(){this.#e.disconnect()}scheduleRender(){this.schedulable.scheduleRender(),this.dispatchEvent(new CustomEvent("render-scheduled"))}#r=null;async twisty3DPuzzle(){return this.#r??=(async()=>{if(this.puzzleLoader.id==="3x3x3"&&this.visualizationStrategy==="Cube3D"){let[e,t,r,n,i,a]=await Promise.all([this.model.twistySceneModel.foundationStickerSprite.get(),this.model.twistySceneModel.hintStickerSprite.get(),this.model.twistySceneModel.stickeringMask.get(),this.model.twistySceneModel.initialHintFaceletsAnimation.get(),this.model.twistySceneModel.faceletScale.get(),this.model.twistySceneModel.hintFaceletsElevation.get()]);return(await V).cube3DShim(()=>this.schedulable.scheduleRender(),{foundationSprite:e,hintSprite:t,experimentalStickeringMask:r,initialHintFaceletsAnimation:n,faceletScale:i,hintFaceletsElevation:a})}else{let[e,t,r,n]=await Promise.all([this.model.twistySceneModel.hintFacelet.get(),this.model.twistySceneModel.foundationStickerSprite.get(),this.model.twistySceneModel.hintStickerSprite.get(),this.model.twistySceneModel.faceletScale.get()]),i=(await V).pg3dShim(()=>this.schedulable.scheduleRender(),this.puzzleLoader,e==="auto"?"floating":e,n,this.puzzleLoader.id==="kilominx");return i.then(a=>a.experimentalUpdateTexture(!0,t??void 0,r??void 0)),i}})()}async raycastMove(e,t){let r=await this.twisty3DPuzzle();if(!("experimentalGetControlTargets"in r)){console.info("not PG3D! skipping raycast");return}let n=r.experimentalGetControlTargets(),[i,a]=await Promise.all([e,this.model.twistySceneModel.movePressCancelOptions.get()]),s=i.intersectObjects(n);if(s.length>0){let l=r.getClosestMoveToAxis(s[0].point,t);l?this.model.experimentalAddMove(l.move,{cancel:a}):console.info("Skipping move!")}}},Pe=class extends P{#e=new ae(this,"back-view-",["auto","none","side-by-side","top-right"]);#r=new $;disconnect(){this.#r.disconnect()}model;constructor(e){super(),this.model=e}async connectedCallback(){this.addCSS(Oe);let e=new be(this.model,this);this.addVantage(e),this.model&&(this.#r.addMultiListener([this.model.puzzleLoader,this.model.visualizationStrategy],this.onPuzzle.bind(this)),this.#r.addListener(this.model.backView,this.setBackView.bind(this))),this.scheduleRender()}#t=null;setBackView(e){let t=["side-by-side","top-right"].includes(e),r=this.#t!==null;this.#e.setValue(e),t?r||(this.#t=new be(this.model,this,{backView:!0}),this.addVantage(this.#t),this.scheduleRender()):this.#t&&(this.removeVantage(this.#t),this.#t=null)}async onPress(e){let t=this.#n;if(!t){console.info("no wrapper; skipping scene wrapper press!");return}let r=(async()=>{let[n,{ThreeRaycaster:i,ThreeVector2:a}]=await Promise.all([e.detail.cameraPromise,(async()=>{let{ThreeRaycaster:c,ThreeVector2:o}=await V;return{ThreeRaycaster:c,ThreeVector2:o}})()]),s=new i,l=new a(e.detail.pressInfo.normalizedX,e.detail.pressInfo.normalizedY);return s.setFromCamera(l,n),s})();await t.raycastMove(r,{invert:!e.detail.pressInfo.rightClick,depth:e.detail.pressInfo.keys.ctrlOrMetaKey?"rotation":e.detail.pressInfo.keys.shiftKey?"secondSlice":"none"})}#i;async scene(){return this.#i??=(async()=>new(await V).ThreeScene)()}#a=new Set;addVantage(e){e.addEventListener("press",this.onPress.bind(this)),this.#a.add(e),this.contentWrapper.appendChild(e)}removeVantage(e){this.#a.delete(e),e.remove(),e.disconnect(),this.#n?.disconnect()}experimentalVantages(){return this.#a.values()}scheduleRender(){for(let e of this.#a)e.scheduleRender()}#n=null;async setCurrentTwisty3DPuzzleWrapper(e,t){let r=this.#n;try{this.#n=t,r?.disconnect(),e.add(await t.twisty3DPuzzle())}finally{r&&e.remove(await r.twisty3DPuzzle())}this.#s.handleNewValue(t)}#s=new jt;async experimentalTwisty3DPuzzleWrapper(){return this.#n||this.#s.promise}#o=new Ae;async onPuzzle(e){if(e[1]==="2D")return;this.#n?.disconnect();let[t,r]=await this.#o.queue(Promise.all([this.scene(),new Bt(this.model,this,e[0],e[1])]));this.setCurrentTwisty3DPuzzleWrapper(t,r)}};b.define("twisty-3d-scene-wrapper",Pe);var W=typeof document>"u"?null:document,Or=W?.fullscreenEnabled||!!W?.webkitFullscreenEnabled;function Fr(){return document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen()}function vt(){return document.fullscreenElement?document.fullscreenElement:document.webkitFullscreenElement??null}function jr(e){return e.requestFullscreen?e.requestFullscreen():e.webkitRequestFullscreen()}var Br=["skip-to-start","skip-to-end","step-forward","step-backward","pause","play","enter-fullscreen","exit-fullscreen","twizzle-tw"],Vr=class extends f{derive(e){return{fullscreen:{enabled:Or,icon:document.fullscreenElement===null?"enter-fullscreen":"exit-fullscreen",title:"Enter fullscreen"},"jump-to-start":{enabled:!e.coarseTimelineInfo.atStart,icon:"skip-to-start",title:"Restart"},"play-step-backwards":{enabled:!e.coarseTimelineInfo.atStart,icon:"step-backward",title:"Step backward"},"play-pause":{enabled:!(e.coarseTimelineInfo.atStart&&e.coarseTimelineInfo.atEnd),icon:e.coarseTimelineInfo.playing?"pause":"play",title:e.coarseTimelineInfo.playing?"Pause":"Play"},"play-step":{enabled:!e.coarseTimelineInfo.atEnd,icon:"step-forward",title:"Step forward"},"jump-to-end":{enabled:!e.coarseTimelineInfo.atEnd,icon:"skip-to-end",title:"Skip to End"},"twizzle-link":{enabled:!0,icon:"twizzle-tw",title:"View at Twizzle",hidden:e.viewerLink==="none"}}}},Vt=new E;Vt.replaceSync(`
:host {
  width: 384px;
  height: 24px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.wrapper {
  grid-auto-flow: column;
}

.viewer-link-none .twizzle-link-button {
  display: none;
}

.wrapper twisty-button,
.wrapper twisty-control-button {
  width: inherit;
  height: inherit;
}
`);var Ut=new E;Ut.replaceSync(`
:host:not([hidden]) {
  display: grid;
}

:host {
  width: 48px;
  height: 24px;
}

.wrapper {
  width: 100%;
  height: 100%;
}

button {
  width: 100%;
  height: 100%;
  border: none;
  
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  background-color: rgba(196, 196, 196, 0.75);
}

button:enabled {
  background-color: rgba(196, 196, 196, 0.75)
}

.dark-mode button:enabled {
  background-color: #88888888;
}

button:disabled {
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0.25;
  pointer-events: none;
}

.dark-mode button:disabled {
  background-color: #ffffff44;
}

button:enabled:hover {
  background-color: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 1em rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

/* TODO: fullscreen icons have too much padding?? */
.svg-skip-to-start button,
button.svg-skip-to-start {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjQzIDEwMzdxMTktMTkgMzItMTN0MTMgMzJ2MTQ3MnEwIDI2LTEzIDMydC0zMi0xM2wtNzEwLTcxMHEtOS05LTEzLTE5djcxMHEwIDI2LTEzIDMydC0zMi0xM2wtNzEwLTcxMHEtOS05LTEzLTE5djY3OHEwIDI2LTE5IDQ1dC00NSAxOUg5NjBxLTI2IDAtNDUtMTl0LTE5LTQ1VjEwODhxMC0yNiAxOS00NXQ0NS0xOWgxMjhxMjYgMCA0NSAxOXQxOSA0NXY2NzhxNC0xMSAxMy0xOWw3MTAtNzEwcTE5LTE5IDMyLTEzdDEzIDMydjcxMHE0LTExIDEzLTE5eiIvPjwvc3ZnPg==");
}

.svg-skip-to-end button,
button.svg-skip-to-end {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik05NDEgMjU0N3EtMTkgMTktMzIgMTN0LTEzLTMyVjEwNTZxMC0yNiAxMy0zMnQzMiAxM2w3MTAgNzEwcTggOCAxMyAxOXYtNzEwcTAtMjYgMTMtMzJ0MzIgMTNsNzEwIDcxMHE4IDggMTMgMTl2LTY3OHEwLTI2IDE5LTQ1dDQ1LTE5aDEyOHEyNiAwIDQ1IDE5dDE5IDQ1djE0MDhxMCAyNi0xOSA0NXQtNDUgMTloLTEyOHEtMjYgMC00NS0xOXQtMTktNDV2LTY3OHEtNSAxMC0xMyAxOWwtNzEwIDcxMHEtMTkgMTktMzIgMTN0LTEzLTMydi03MTBxLTUgMTAtMTMgMTl6Ii8+PC9zdmc+");
}

.svg-step-forward button,
button.svg-step-forward {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjg4IDE1NjhxMCAyNi0xOSA0NWwtNTEyIDUxMnEtMTkgMTktNDUgMTl0LTQ1LTE5cS0xOS0xOS0xOS00NXYtMjU2aC0yMjRxLTk4IDAtMTc1LjUgNnQtMTU0IDIxLjVxLTc2LjUgMTUuNS0xMzMgNDIuNXQtMTA1LjUgNjkuNXEtNDkgNDIuNS04MCAxMDF0LTQ4LjUgMTM4LjVxLTE3LjUgODAtMTcuNSAxODEgMCA1NSA1IDEyMyAwIDYgMi41IDIzLjV0Mi41IDI2LjVxMCAxNS04LjUgMjV0LTIzLjUgMTBxLTE2IDAtMjgtMTctNy05LTEzLTIydC0xMy41LTMwcS03LjUtMTctMTAuNS0yNC0xMjctMjg1LTEyNy00NTEgMC0xOTkgNTMtMzMzIDE2Mi00MDMgODc1LTQwM2gyMjR2LTI1NnEwLTI2IDE5LTQ1dDQ1LTE5cTI2IDAgNDUgMTlsNTEyIDUxMnExOSAxOSAxOSA0NXoiLz48L3N2Zz4=");
}

.svg-step-backward button,
button.svg-step-backward {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjg4IDIwNDhxMCAxNjYtMTI3IDQ1MS0zIDctMTAuNSAyNHQtMTMuNSAzMHEtNiAxMy0xMyAyMi0xMiAxNy0yOCAxNy0xNSAwLTIzLjUtMTB0LTguNS0yNXEwLTkgMi41LTI2LjV0Mi41LTIzLjVxNS02OCA1LTEyMyAwLTEwMS0xNy41LTE4MXQtNDguNS0xMzguNXEtMzEtNTguNS04MC0xMDF0LTEwNS41LTY5LjVxLTU2LjUtMjctMTMzLTQyLjV0LTE1NC0yMS41cS03Ny41LTYtMTc1LjUtNmgtMjI0djI1NnEwIDI2LTE5IDQ1dC00NSAxOXEtMjYgMC00NS0xOWwtNTEyLTUxMnEtMTktMTktMTktNDV0MTktNDVsNTEyLTUxMnExOS0xOSA0NS0xOXQ0NSAxOXExOSAxOSAxOSA0NXYyNTZoMjI0cTcxMyAwIDg3NSA0MDMgNTMgMTM0IDUzIDMzM3oiLz48L3N2Zz4=");
}

.svg-pause button,
button.svg-pause {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNTYwIDEwODh2MTQwOHEwIDI2LTE5IDQ1dC00NSAxOWgtNTEycS0yNiAwLTQ1LTE5dC0xOS00NVYxMDg4cTAtMjYgMTktNDV0NDUtMTloNTEycTI2IDAgNDUgMTl0MTkgNDV6bS04OTYgMHYxNDA4cTAgMjYtMTkgNDV0LTQ1IDE5aC01MTJxLTI2IDAtNDUtMTl0LTE5LTQ1VjEwODhxMC0yNiAxOS00NXQ0NS0xOWg1MTJxMjYgMCA0NSAxOXQxOSA0NXoiLz48L3N2Zz4=");
}

.svg-play button,
button.svg-play {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNDcyLjUgMTgyM2wtMTMyOCA3MzhxLTIzIDEzLTM5LjUgM3QtMTYuNS0zNlYxMDU2cTAtMjYgMTYuNS0zNnQzOS41IDNsMTMyOCA3MzhxMjMgMTMgMjMgMzF0LTIzIDMxeiIvPjwvc3ZnPg==");
}

.svg-enter-fullscreen button,
button.svg-enter-fullscreen {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgd2lkdGg9IjI4Ij48cGF0aCBkPSJNMiAyaDI0djI0SDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTkgMTZIN3Y1aDV2LTJIOXYtM3ptLTItNGgyVjloM1Y3SDd2NXptMTIgN2gtM3YyaDV2LTVoLTJ2M3pNMTYgN3YyaDN2M2gyVjdoLTV6Ii8+PC9zdmc+");
}

.svg-exit-fullscreen button,
button.svg-exit-fullscreen {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgd2lkdGg9IjI4Ij48cGF0aCBkPSJNMiAyaDI0djI0SDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTcgMThoM3YzaDJ2LTVIN3Yyem0zLThIN3YyaDVWN2gtMnYzem02IDExaDJ2LTNoM3YtMmgtNXY1em0yLTExVjdoLTJ2NWg1di0yaC0zeiIvPjwvc3ZnPg==");
}

.svg-twizzle-tw button,
button.svg-twizzle-tw {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODY0IiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzk3LjU4MSAxNTEuMTh2NTcuMDg0aC04OS43MDN2MjQwLjM1MmgtNjYuOTU1VjIwOC4yNjRIMTUxLjIydi01Ny4wODNoMjQ2LjM2MXptNTQuMzEgNzEuNjc3bDcuNTEyIDMzLjY5MmMyLjcxOCAxMi4xNiA1LjU4IDI0LjY4IDguNTg0IDM3LjU1NWEyMTgwLjc3NSAyMTgwLjc3NSAwIDAwOS40NDIgMzguODQzIDEyNjYuMyAxMjY2LjMgMCAwMDEwLjA4NiAzNy41NTVjMy43Mi0xMi41OSA3LjM2OC0yNS40NjYgMTAuOTQ1LTM4LjYyOCAzLjU3Ni0xMy4xNjIgNy4wMS0yNi4xMSAxMC4zLTM4Ljg0M2w1Ljc2OS0yMi40NTZjMS4yNDgtNC44ODcgMi40NzItOS43MDUgMy42NzQtMTQuNDU1IDMuMDA0LTExLjg3NSA1LjY1MS0yMi45NjIgNy45NC0zMy4yNjNoNDYuMzU0bDIuMzg0IDEwLjU2M2EyMDAwLjc3IDIwMDAuNzcgMCAwMDMuOTM1IDE2LjgyOGw2LjcxMSAyNy43MWMxLjIxMyA0Ljk1NiAyLjQ1IDkuOTggMy43MDkgMTUuMDczYTMxMTkuNzc3IDMxMTkuNzc3IDAgMDA5Ljg3MSAzOC44NDMgMTI0OS4yMjcgMTI0OS4yMjcgMCAwMDEwLjczIDM4LjYyOCAxOTA3LjYwNSAxOTA3LjYwNSAwIDAwMTAuMzAxLTM3LjU1NSAxMzk3Ljk0IDEzOTcuOTQgMCAwMDkuNjU3LTM4Ljg0M2w0LjQtMTkuMDQ2Yy43MTUtMy4xMyAxLjQyMS02LjIzNiAyLjExOC05LjMyMWw5LjU3Ny00Mi44OGg2Ni41MjZhMjk4OC43MTggMjk4OC43MTggMCAwMS0xOS41MjkgNjYuMzExbC01LjcyOCAxOC40ODJhMzIzNy40NiAzMjM3LjQ2IDAgMDEtMTQuMDE1IDQzLjc1MmMtNi40MzggMTkuNi0xMi43MzMgMzcuNjk4LTE4Ljg4NSA1NC4yOTRsLTMuMzA2IDguODI1Yy00Ljg4NCAxMi44OTgtOS40MzMgMjQuMjYzLTEzLjY0NyAzNC4wOTVoLTQ5Ljc4N2E4NDE3LjI4OSA4NDE3LjI4OSAwIDAxLTIxLjAzMS02NC44MDkgMTI4OC42ODYgMTI4OC42ODYgMCAwMS0xOC44ODUtNjQuODEgMTk3Mi40NDQgMTk3Mi40NDQgMCAwMS0xOC4yNCA2NC44MSAyNTc5LjQxMiAyNTc5LjQxMiAwIDAxLTIwLjM4OCA2NC44MWgtNDkuNzg3Yy00LjY4Mi0xMC45MjYtOS43Mi0yMy43NDMtMTUuMTEtMzguNDUxbC0xLjYyOS00LjQ3Yy01LjI1OC0xNC41MjEtMTAuNjgtMzAuMTkyLTE2LjI2Ni00Ny4wMTRsLTIuNDA0LTcuMjhjLTYuNDM4LTE5LjYtMTMuMDItNDAuMzQ0LTE5Ljc0My02Mi4yMzRhMjk4OC43MDcgMjk4OC43MDcgMCAwMS0xOS41MjktNjYuMzExaDY3LjM4NXoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==");
}
`);var wt={fullscreen:!0,"jump-to-start":!0,"play-step-backwards":!0,"play-pause":!0,"play-step":!0,"jump-to-end":!0,"twizzle-link":!0},qt=class extends P{buttons=null;model;controller;defaultFullscreenElement;constructor(e,t,r){super(),this.model=e,this.controller=t,this.defaultFullscreenElement=r}connectedCallback(){this.addCSS(Vt);let e={};for(let t in wt){let r=new Wt;e[t]=r,r.htmlButton.addEventListener("click",()=>this.#e(t)),this.addElement(r)}this.buttons=e,this.model?.buttonAppearance.addFreshListener(this.update.bind(this)),this.model?.twistySceneModel.colorScheme.addFreshListener(this.updateColorScheme.bind(this))}#e(e){switch(e){case"fullscreen":{this.onFullscreenButton();break}case"jump-to-start":{this.controller?.jumpToStart({flash:!0});break}case"play-step-backwards":{this.controller?.animationController.play({direction:k.Backwards,untilBoundary:q.Move});break}case"play-pause":{this.controller?.togglePlay();break}case"play-step":{this.controller?.animationController.play({direction:k.Forwards,untilBoundary:q.Move});break}case"jump-to-end":{this.controller?.jumpToEnd({flash:!0});break}case"twizzle-link":{this.controller?.visitTwizzleLink();break}default:throw new Error("Missing command")}}async onFullscreenButton(){if(!this.defaultFullscreenElement)throw new Error("Attempted to go fullscreen without an element.");if(vt()===this.defaultFullscreenElement)Fr();else{this.buttons?.fullscreen.setIcon("exit-fullscreen"),jr(await this.model?.twistySceneModel.fullscreenElement.get()??this.defaultFullscreenElement);let e=()=>{vt()!==this.defaultFullscreenElement&&(this.buttons?.fullscreen.setIcon("enter-fullscreen"),globalThis.removeEventListener("fullscreenchange",e))};globalThis.addEventListener("fullscreenchange",e)}}async update(e){for(let t in wt){let r=this.buttons[t],n=e[t];r.htmlButton.disabled=!n.enabled,r.htmlButton.title=n.title,r.setIcon(n.icon),r.hidden=!!n.hidden}}updateColorScheme(e){for(let t of Object.values(this.buttons??{}))t.updateColorScheme(e)}};b.define("twisty-buttons",qt);var Wt=class extends P{htmlButton=document.createElement("button");updateColorScheme(e){this.contentWrapper.classList.toggle("dark-mode",e==="dark")}connectedCallback(){this.addCSS(Ut),this.addElement(this.htmlButton)}#e=new ae(this,"svg-",Br);setIcon(e){this.#e.setValue(e)}};b.define("twisty-button",Wt);var Qt=new E;Qt.replaceSync(`
:host {
  width: 384px;
  height: 16px;
  display: grid;
}

.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  overflow: hidden;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(196, 196, 196, 0.75);
}

input:not(:disabled) {
  cursor: ew-resize;
}

.wrapper.dark-mode {
  background: #666666;
}
`);var Ur=!1,fe=!1;W?.addEventListener("mousedown",e=>{e.which&&(fe=!0)},!0);W?.addEventListener("mouseup",e=>{e.which&&(fe=!1)},!0);var Ne=0,pe=0;W?.addEventListener("mousedown",()=>{pe++},!1);W?.addEventListener("mousemove",Ht,!1);W?.addEventListener("mouseenter",Ht,!1);function Ht(e){Ne=e.pageY}var Mt=0,yt=0,ke=!1,Ie=0,Yt=class extends P{model;controller;constructor(e,t){super(),this.model=e,this.controller=t}async onDetailedTimelineInfo(e){let t=await this.inputElem();t.min=e.timeRange.start.toString(),t.max=e.timeRange.end.toString(),t.disabled=t.min===t.max,t.value=e.timestamp.toString()}async connectedCallback(){this.addCSS(Qt),this.addElement(await this.inputElem()),this.model?.twistySceneModel.colorScheme.addFreshListener(this.updateColorScheme.bind(this))}updateColorScheme(e){this.contentWrapper.classList.toggle("dark-mode",e==="dark")}#e=null;async inputElem(){return this.#e??=(async()=>{let e=document.createElement("input");return e.type="range",e.disabled=!0,this.model?.detailedTimelineInfo.addFreshListener(this.onDetailedTimelineInfo.bind(this)),e.addEventListener("input",this.onInput.bind(this)),e.addEventListener("keydown",this.onKeypress.bind(this)),e})()}async onInput(e){if(ke)return;let t=await this.inputElem();await this.slowDown(e,t);let r=parseInt(t.value,10);this.model?.playingInfo.set({playing:!1}),this.model?.timestampRequest.set(r)}onKeypress(e){switch(e.key){case"ArrowLeft":case"ArrowRight":{this.controller?.animationController.play({direction:e.key==="ArrowLeft"?k.Backwards:k.Forwards,untilBoundary:q.Move}),e.preventDefault();break}case" ":{this.controller?.togglePlay(),e.preventDefault();break}}}async slowDown(e,t){if(Ur&&fe){let r=t.getBoundingClientRect(),n=r.top+r.height/2;console.log(n,e,Ne,fe);let i=Math.abs(n-Ne),a=1;i>64&&(a=Math.max(2**(-(i-64)/64),1/32));let s=parseInt(t.value,10);if(console.log("cl",Ie,pe,s),Ie===pe){let l=(s-yt)*a;console.log("delta",l,i),ke=!0;let c=s;c=Mt+l*a+(s-Mt)*Math.min(1,(1/2)**(i*i/64)),t.value=c.toString(),console.log(a),ke=!1,this.contentWrapper.style.opacity=a.toString()}else Ie=pe;yt=s}}};b.define("twisty-scrubber",Yt);var qr=null;async function xt(e,t){let[{ThreePerspectiveCamera:r,ThreeScene:n},i,a,s,l,c,o]=await Promise.all([(async()=>{let{ThreePerspectiveCamera:R,ThreeScene:Q}=await V;return{ThreePerspectiveCamera:R,ThreeScene:Q}})(),await e.puzzleLoader.get(),await e.visualizationStrategy.get(),await e.twistySceneModel.stickeringRequest.get(),await e.twistySceneModel.stickeringMaskRequest.get(),await e.legacyPosition.get(),await e.twistySceneModel.orbitCoordinates.get()]),d=t?.width??2048,u=t?.height??2048,h=d/u,g=qr??=await(async()=>new r(20,h,.1,20))(),M=new n,I=new Bt(e,{scheduleRender:()=>{}},i,a);M.add(await I.twisty3DPuzzle()),await $e(g,o);let L=(await Ze(d,u,M,g)).toDataURL(),D=await _t(e);return{dataURL:L,download:async R=>{Gt(L,R??D)}}}async function _t(e){let[t,r]=await Promise.all([e.puzzleID.get(),e.alg.get()]);return`[${t}]${r.alg.experimentalNumChildAlgNodes()===0?"":` ${r.alg.toString()}`}`}function Gt(e,t,r="png"){let n=document.createElement("a");n.href=e,n.download=`${t}.${r}`,n.click()}var Zt=new E;Zt.replaceSync(`
:host {
  width: 384px;
  height: 256px;
  display: grid;

  -webkit-user-select: none;
  user-select: none;
}

.wrapper {
  display: grid;
  overflow: hidden;
  contain: size;
  grid-template-rows: 7fr minmax(1.5em, 0.5fr) minmax(2em, 1fr);
}

.wrapper > * {
  width: inherit;
  height: inherit;
  overflow: hidden;
}

.wrapper.controls-none {
  grid-template-rows: 7fr;
}

.wrapper.controls-none twisty-scrubber,
.wrapper.controls-none twisty-control-button-panel ,
.wrapper.controls-none twisty-scrubber,
.wrapper.controls-none twisty-buttons {
  display: none;
}

twisty-scrubber {
  background: rgba(196, 196, 196, 0.5);
}

.wrapper.checkered,
.wrapper.checkered-transparent {
  background-color: #EAEAEA;
  background-image: linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD),
    linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}

.wrapper.checkered-transparent {
  background-color: #F4F4F4;
  background-image: linear-gradient(45deg, #DDDDDD88 25%, transparent 25%, transparent 75%, #DDDDDD88 75%, #DDDDDD88),
    linear-gradient(45deg, #DDDDDD88 25%, transparent 25%, transparent 75%, #DDDDDD88 75%, #DDDDDD88);
}

.wrapper.dark-mode {
  background-color: #444;
  background-image: linear-gradient(45deg, #DDDDDD0b 25%, transparent 25%, transparent 75%, #DDDDDD0b 75%, #DDDDDD0b),
    linear-gradient(45deg, #DDDDDD0b 25%, transparent 25%, transparent 75%, #DDDDDD0b 75%, #DDDDDD0b);
}

.visualization-wrapper > * {
  width: 100%;
  height: 100%;
}

.error-elem {
  width: 100%;
  height: 100%;
  display: none;
  place-content: center;
  font-family: sans-serif;
  box-shadow: inset 0 0 2em rgb(255, 0, 0);
  color: red;
  text-shadow: 0 0 0.2em white;
  background: rgba(255, 255, 255, 0.25);
}

.wrapper.error .visualization-wrapper {
  display: none;
}

.wrapper.error .error-elem {
  display: grid;
}
`);var zt=class extends p{getDefaultValue(){return null}},Re=class extends B{getDefaultValue(){return null}derive(e){return typeof e=="string"?new URL(e,location.href):e}},ie=class $t{warnings;errors;constructor(t){this.warnings=Object.freeze(t?.warnings??[]),this.errors=Object.freeze(t?.errors??[]),Object.freeze(this)}add(t){return new $t({warnings:this.warnings.concat(t?.warnings??[]),errors:this.errors.concat(t?.errors??[])})}log(){this.errors.length>0?console.error(`\u{1F6A8} ${this.errors[0]}`):this.warnings.length>0?console.warn(`\u26A0\uFE0F ${this.warnings[0]}`):console.info("\u{1F60E} No issues!")}};function Xt(e){try{let t=z.fromString(e),r=[];return t.toString()!==e&&r.push("Alg is non-canonical!"),{alg:t,issues:new ie({warnings:r})}}catch(t){return{alg:new z,issues:new ie({errors:[`Malformed alg: ${t.toString()}`]})}}}function Wr(e,t){return e.alg.isIdentical(t.alg)&&Ce(e.issues.warnings,t.issues.warnings)&&Ce(e.issues.errors,t.issues.errors)}var Tt=class extends B{getDefaultValue(){return{alg:new z,issues:new ie}}canReuseValue(e,t){return Wr(e,t)}async derive(e){return typeof e=="string"?Xt(e):{alg:e,issues:new ie}}},Qr=class extends f{derive(e){return e.kpuzzle.algToTransformation(e.setupAlg.alg)}},Hr=class extends f{derive(e){if(e.setupTransformation)return e.setupTransformation;switch(e.setupAnchor){case"start":return e.setupAlgTransformation;case"end":{let r=e.indexer.transformationAtIndex(e.indexer.numAnimatedLeaves()).invert();return e.setupAlgTransformation.applyTransformation(r)}default:throw new Error("Unimplemented!")}}},Yr=class extends p{getDefaultValue(){return null}},_r=class extends p{getDefaultValue(){return{move:null,amount:0}}canReuseValue(e,t){return e.move===t.move&&e.amount===t.amount}},Gr=class extends f{derive(e){return{patternIndex:e.currentMoveInfo.patternIndex,movesFinishing:e.currentMoveInfo.movesFinishing.map(t=>t.move),movesFinished:e.currentMoveInfo.movesFinished.map(t=>t.move)}}canReuseValue(e,t){return e.patternIndex===t.patternIndex&&ft(e.movesFinishing,t.movesFinishing,(r,n)=>r.isIdentical(n))&&ft(e.movesFinished,t.movesFinished,(r,n)=>r.isIdentical(n))}},Zr=class extends f{derive(e){function t(r){return e.detailedTimelineInfo.atEnd&&e.catchUpMove.move!==null&&r.currentMoves.push({move:e.catchUpMove.move,direction:k.Backwards,fraction:1-e.catchUpMove.amount,startTimestamp:-1,endTimestamp:-1}),r}if(e.indexer.currentMoveInfo)return t(e.indexer.currentMoveInfo(e.detailedTimelineInfo.timestamp));{let r=e.indexer.timestampToIndex(e.detailedTimelineInfo.timestamp),n={patternIndex:r,currentMoves:[],movesFinishing:[],movesFinished:[],movesStarting:[],latestStart:-1/0,earliestEnd:1/0};if(e.indexer.numAnimatedLeaves()>0){let i=e.indexer.getAnimLeaf(r)?.as(A);if(!i)return t(n);let a=e.indexer.indexToMoveStartTimestamp(r),s=e.indexer.moveDuration(r),l=s?(e.detailedTimelineInfo.timestamp-a)/s:0,c=a+s,o={move:i,direction:k.Forwards,fraction:l,startTimestamp:a,endTimestamp:c};l===0?n.movesStarting.push(o):l===1?n.movesFinishing.push(o):(n.currentMoves.push(o),n.latestStart=Math.max(n.latestStart,a),n.earliestEnd=Math.min(n.earliestEnd,c))}return t(n)}}},$r=class extends f{derive(e){let t=e.indexer.transformationAtIndex(e.currentLeavesSimplified.patternIndex);t=e.anchoredStart.applyTransformation(t);for(let r of e.currentLeavesSimplified.movesFinishing)t=t.applyMove(r);for(let r of e.currentLeavesSimplified.movesFinished)t=t.applyMove(r);return t.toKPattern()}},At={u:"y",l:"x",f:"z",r:"x",b:"z",d:"y",m:"x",e:"y",s:"z",x:"x",y:"y",z:"z"};function Xr(e,t){return At[e.family[0].toLowerCase()]===At[t.family[0].toLowerCase()]}var Jr=class extends N{traverseAlg(e){let t=[];for(let r of e.childAlgNodes())t.push(this.traverseAlgNode(r));return Array.prototype.concat(...t)}traverseGroupingOnce(e){if(e.experimentalIsEmpty())return[];let t=[];for(let i of e.childAlgNodes()){if(!(i.is(A)||i.is(Me)||i.is(ye)))return this.traverseAlg(e);let a=i.as(A);a&&t.push(a)}let r=U(t[0].amount);for(let i=0;i<t.length-1;i++){for(let a=1;a<t.length;a++)if(!Xr(t[i],t[a]))return this.traverseAlg(e);r=Math.max(r,U(t[i].amount))}let n=t.map(i=>({animLeafAlgNode:i,msUntilNext:0,duration:r}));return n[n.length-1].msUntilNext=r,n}traverseGrouping(e){let t=[],r=e.amount>0?e.alg:e.alg.invert();for(let n=0;n<Math.abs(e.amount);n++)t.push(this.traverseGroupingOnce(r));return Array.prototype.concat(...t)}traverseMove(e){let t=U(e.amount);return[{animLeafAlgNode:e,msUntilNext:t,duration:t}]}traverseCommutator(e){let t=[],r=[e.A,e.B,e.A.invert(),e.B.invert()];for(let n of r)t.push(this.traverseGroupingOnce(n));return Array.prototype.concat(...t)}traverseConjugate(e){let t=[],r=[e.A,e.B,e.A.invert()];for(let n of r)t.push(this.traverseGroupingOnce(n));return Array.prototype.concat(...t)}traversePause(e){if(e.experimentalNISSGrouping)return[];let t=U(1);return[{animLeafAlgNode:e,msUntilNext:t,duration:t}]}traverseNewline(e){return[]}traverseLineComment(e){return[]}},Kr=S(Jr);function en(e){let t=0;return Kr(e).map(n=>{let i={animLeaf:n.animLeafAlgNode,start:t,end:t+n.duration};return t+=n.msUntilNext,i})}var Le=class{animLeaves;kpuzzle;constructor(e,t,r){this.kpuzzle=e,this.animLeaves=r?.animationTimelineLeaves??en(t)}getAnimLeaf(e){return this.animLeaves[Math.min(e,this.animLeaves.length-1)]?.animLeaf??null}getAnimationTimelineLeaf(e){return this.animLeaves[Math.min(e,this.animLeaves.length-1)]}indexToMoveStartTimestamp(e){let t=0;return this.animLeaves.length>0&&(t=this.animLeaves[Math.min(e,this.animLeaves.length-1)].start),t}timestampToIndex(e){let t=0;for(t=0;t<this.animLeaves.length;t++)if(this.animLeaves[t].start>=e)return Math.max(0,t-1);return Math.max(0,t-1)}timestampToPosition(e,t){let r=this.currentMoveInfo(e),n=t??this.kpuzzle.identityTransformation().toKPattern();for(let i of this.animLeaves.slice(0,r.patternIndex)){let a=i.animLeaf.as(A);a!==null&&(n=n.applyMove(a))}return{pattern:n,movesInProgress:r.currentMoves}}currentMoveInfo(e){let t=1/0;for(let o of this.animLeaves)if(o.start<=e&&o.end>=e)t=Math.min(t,o.start);else if(o.start>e)break;let r=[],n=[],i=[],a=[],s=-1/0,l=1/0,c=0;for(let o of this.animLeaves)if(o.end<=t){if(!isFinite(t)&&o.start>e)break;c++}else{if(o.start>e)break;{let d=o.animLeaf.as(A);if(d!==null){let u=(e-o.start)/(o.end-o.start),h=!1;u>1&&(u=1,h=!0);let g={move:d,direction:k.Forwards,fraction:u,startTimestamp:o.start,endTimestamp:o.end};switch(u){case 0:{n.push(g);break}case 1:{h?a.push(g):i.push(g);break}default:r.push(g),s=Math.max(s,o.start),l=Math.min(l,o.end)}}}}return{patternIndex:c,currentMoves:r,latestStart:s,earliestEnd:l,movesStarting:n,movesFinishing:i,movesFinished:a}}patternAtIndex(e,t){let r=t??this.kpuzzle.defaultPattern();for(let n=0;n<this.animLeaves.length&&n<e;n++){let a=this.animLeaves[n].animLeaf.as(A);a!==null&&(r=r.applyMove(a))}return r}transformationAtIndex(e){let t=this.kpuzzle.identityTransformation();for(let r of this.animLeaves.slice(0,e)){let n=r.animLeaf.as(A);n!==null&&(t=t.applyMove(n))}return t}algDuration(){let e=0;for(let t of this.animLeaves)e=Math.max(e,t.end);return e}numAnimatedLeaves(){return this.animLeaves.length}moveDuration(e){let t=this.getAnimationTimelineLeaf(e);return t.end-t.start}},tn=1024,rn=class extends f{derive(e){switch(e.indexerConstructorRequest){case"auto":return e.animationTimelineLeaves!==null||dt(e.alg.alg)<=tn&&e.puzzle==="3x3x3"&&e.visualizationStrategy==="Cube3D"?Le:mt;case"tree":return mt;case"simple":return Mr;case"simultaneous":return Le;default:throw new Error("Invalid indexer request!")}}},nn=class extends p{getDefaultValue(){return"auto"}},an=class extends f{derive(e){return new e.indexerConstructor(e.kpuzzle,e.algWithIssues.alg,{animationTimelineLeaves:e.animationTimelineLeaves})}},sn=class extends f{derive(e){return{pattern:e.currentPattern,movesInProgress:e.currentMoveInfo.currentMoves}}},on=!0,St=class extends f{async derive(e){try{return on&&e.kpuzzle.algToTransformation(e.algWithIssues.alg),e.algWithIssues}catch(t){return{alg:new z,issues:new ie({errors:[`Invalid alg for puzzle: ${t.toString()}`]})}}}},ln=class extends p{getDefaultValue(){return"start"}},cn=class extends p{getDefaultValue(){return null}},un=class extends f{async derive(e){return e.puzzleLoader.kpuzzle()}},dn=class extends p{getDefaultValue(){return Z}},hn=class extends f{async derive(e){return e.puzzleLoader.id}},mn=class extends p{getDefaultValue(){return Z}},pn=class extends f{derive(e){if(e.puzzleIDRequest&&e.puzzleIDRequest!==Z){let t=F[e.puzzleIDRequest];return t||this.userVisibleErrorTracker.set({errors:[`Invalid puzzle ID: ${e.puzzleIDRequest}`]}),t}return e.puzzleDescriptionRequest&&e.puzzleDescriptionRequest!==Z?He(e.puzzleDescriptionRequest):Te}},gn=class extends f{derive(e){return{playing:e.playingInfo.playing,atStart:e.detailedTimelineInfo.atStart,atEnd:e.detailedTimelineInfo.atEnd}}canReuseValue(e,t){return e.playing===t.playing&&e.atStart===t.atStart&&e.atEnd===t.atEnd}},fn=class extends f{derive(e){let t=this.#e(e),r=!1,n=!1;return t>=e.timeRange.end&&(n=!0,t=Math.min(e.timeRange.end,t)),t<=e.timeRange.start&&(r=!0,t=Math.max(e.timeRange.start,t)),{timestamp:t,timeRange:e.timeRange,atStart:r,atEnd:n}}#e(e){switch(e.timestampRequest){case"auto":return e.setupAnchor==="start"&&e.setupAlg.alg.experimentalIsEmpty()?e.timeRange.end:e.timeRange.start;case"start":return e.timeRange.start;case"end":return e.timeRange.end;case"anchor":return e.setupAnchor==="start"?e.timeRange.start:e.timeRange.end;case"opposite-anchor":return e.setupAnchor==="start"?e.timeRange.end:e.timeRange.start;default:return e.timestampRequest}}canReuseValue(e,t){return e.timestamp===t.timestamp&&e.timeRange.start===t.timeRange.start&&e.timeRange.end===t.timeRange.end&&e.atStart===t.atStart&&e.atEnd===t.atEnd}},vn=class extends B{async getDefaultValue(){return{direction:k.Forwards,playing:!1,untilBoundary:q.EntireTimeline,loop:!1}}async derive(e,t){let r=await t,n=Object.assign({},r);return Object.assign(n,e),n}canReuseValue(e,t){return e.direction===t.direction&&e.playing===t.playing&&e.untilBoundary===t.untilBoundary&&e.loop===t.loop}},wn=class extends B{getDefaultValue(){return 1}derive(e){return e<0?1:e}},Mn={auto:!0,start:!0,end:!0,anchor:!0,"opposite-anchor":!0},yn=class extends p{getDefaultValue(){return"auto"}set(e){let t=this.get();super.set((async()=>this.validInput(await e)?e:t)())}validInput(e){return!!(typeof e=="number"||Mn[e])}},xn=class extends f{derive(e){return{start:0,end:e.indexer.algDuration()}}},zn=class extends p{getDefaultValue(){return"auto"}},Tn=class extends p{getDefaultValue(){return"auto"}},An=class extends f{derive(e){switch(e.puzzleID){case"clock":case"square1":case"redi_cube":case"melindas2x2x2x2":case"tri_quad":case"loopover":return"2D";case"3x3x3":switch(e.visualizationRequest){case"auto":case"3D":return"Cube3D";default:return e.visualizationRequest}default:switch(e.visualizationRequest){case"auto":case"3D":return"PG3D";case"experimental-2D-LL":case"experimental-2D-LL-face":return["2x2x2","4x4x4","megaminx"].includes(e.puzzleID)?"experimental-2D-LL":"2D";default:return e.visualizationRequest}}}},Sn=class extends p{getDefaultValue(){return"auto"}},bn=class extends p{getDefaultValue(){return"auto"}},kn=class extends p{getDefaultValue(){return"auto"}},In=class extends p{getDefaultValue(){return"auto"}},Ln=null;async function Dn(){return Ln??=new(await V).ThreeTextureLoader}var bt=class extends f{async derive(e){let{spriteURL:t}=e;return t===null?null:new Promise(async(r,n)=>{let i=()=>{console.warn("Could not load sprite:",t.toString()),r(null)};try{(await Dn()).load(t.toString(),r,i,i)}catch{i()}})}},Cn={facelets:["regular","regular","regular","regular","regular"]};async function En(e){let{definition:t}=await e.kpuzzle(),r={orbits:{}};for(let n of t.orbits)r.orbits[n.orbitName]={pieces:new Array(n.numPieces).fill(Cn)};return r}var Pn=class extends f{getDefaultValue(){return{orbits:{}}}async derive(e){return e.stickeringMaskRequest?e.stickeringMaskRequest:e.stickeringRequest==="picture"?{specialBehaviour:"picture",orbits:{}}:e.puzzleLoader.stickeringMask?.(e.stickeringRequest??"full")??En(e.puzzleLoader)}},Nn={"-":C.Regular,D:C.Dim,I:C.Ignored,X:C.Invisible,O:C.IgnoreNonPrimary,P:C.PermuteNonPrimary,o:C.Ignoriented,"?":C.OrientationWithoutPermutation,M:C.Mystery,"@":C.Regular};function Rn(e){let t={orbits:{}},r=e.split(",");for(let n of r){let[i,a,...s]=n.split(":");if(s.length>0)throw new Error(`Invalid serialized orbit stickering mask (too many colons): \`${n}\``);let l=[];t.orbits[i]={pieces:l};for(let c of a){let o=Nn[c];l.push(We(o))}}return t}var On=class extends B{getDefaultValue(){return null}derive(e){return e===null?null:typeof e=="string"?Rn(e):e}},Fn=class extends p{getDefaultValue(){return null}},jn=class extends p{getDefaultValue(){return"auto"}},Bn=class extends p{getDefaultValue(){return{}}},Vn=class extends p{getDefaultValue(){return"auto"}},Un=class extends p{getDefaultValue(){return"auto"}},qn=class extends f{derive(e){return e.colorSchemeRequest==="dark"?"dark":"light"}},Wn=class extends p{getDefaultValue(){return"auto"}},Qn=class extends p{getDefaultValue(){return null}},Hn=35,Yn=class extends p{getDefaultValue(){return Hn}};function Jt(e,t){return e.latitude===t.latitude&&e.longitude===t.longitude&&e.distance===t.distance}var _n=class extends B{getDefaultValue(){return"auto"}canReuseValue(e,t){return e===t||Jt(e,t)}async derive(e,t){if(e==="auto")return"auto";let r=await t;r==="auto"&&(r={});let n=Object.assign({},r);return Object.assign(n,e),typeof n.latitude<"u"&&(n.latitude=Math.min(Math.max(n.latitude,-90),90)),typeof n.longitude<"u"&&(n.longitude=Ee(n.longitude,180,-180)),n}},Gn=class extends f{canReuseValue(e,t){return Jt(e,t)}async derive(e){if(e.orbitCoordinatesRequest==="auto")return It(e.puzzleID,e.strategy);let t=Object.assign(Object.assign({},It(e.puzzleID,e.strategy),e.orbitCoordinatesRequest));if(Math.abs(t.latitude)<=e.latitudeLimit)return t;{let{latitude:r,longitude:n,distance:i}=t;return{latitude:e.latitudeLimit*Math.sign(r),longitude:n,distance:i}}}},Zn={latitude:31.717474411461005,longitude:0,distance:5.877852522924731},$n={latitude:35,longitude:30,distance:6},kt={latitude:35,longitude:30,distance:6.25},Xn={latitude:Math.atan(1/2)*Ge,longitude:0,distance:6.7},Jn={latitude:26.56505117707799,longitude:0,distance:6};function It(e,t){if(e[1]==="x")return t==="Cube3D"?$n:kt;switch(e){case"megaminx":case"gigaminx":return Xn;case"pyraminx":case"master_tetraminx":return Jn;case"skewb":return kt;default:return Zn}}var Kn=class{background=new Un;colorSchemeRequest=new Wn;dragInput=new jn;foundationDisplay=new bn;foundationStickerSpriteURL=new Re;fullscreenElement=new Qn;hintFacelet=new _e;hintStickerSpriteURL=new Re;initialHintFaceletsAnimation=new In;hintFaceletsElevation=new kn;latitudeLimit=new Yn;movePressInput=new Vn;movePressCancelOptions=new Bn;orbitCoordinatesRequest=new _n;stickeringMaskRequest=new On;stickeringRequest=new Fn;faceletScale=new Sn;colorScheme=new qn({colorSchemeRequest:this.colorSchemeRequest});foundationStickerSprite=new bt({spriteURL:this.foundationStickerSpriteURL});hintStickerSprite=new bt({spriteURL:this.hintStickerSpriteURL});orbitCoordinates;stickeringMask;twistyPlayerModel;constructor(e){this.twistyPlayerModel=e,this.orbitCoordinates=new Gn({orbitCoordinatesRequest:this.orbitCoordinatesRequest,latitudeLimit:this.latitudeLimit,puzzleID:e.puzzleID,strategy:e.visualizationStrategy}),this.stickeringMask=new Pn({stickeringMaskRequest:this.stickeringMaskRequest,stickeringRequest:this.stickeringRequest,puzzleLoader:e.puzzleLoader})}},ei={errors:[]},ti=class extends p{getDefaultValue(){return ei}reset(){this.set(this.getDefaultValue())}canReuseValue(e,t){return Ce(e.errors,t.errors)}},ri=class{userVisibleErrorTracker=new ti;alg=new Tt;backView=new br;controlPanel=new Nr;catchUpMove=new _r;indexerConstructorRequest=new nn;playingInfo=new vn;puzzleDescriptionRequest=new dn;puzzleIDRequest=new mn;setupAnchor=new ln;setupAlg=new Tt;setupTransformation=new cn;tempoScale=new wn;timestampRequest=new yn;viewerLink=new zn;visualizationFormat=new Tn;title=new zt;videoURL=new Re;competitionID=new zt;animationTimelineLeavesRequest=new Yr;puzzleLoader=new pn({puzzleIDRequest:this.puzzleIDRequest,puzzleDescriptionRequest:this.puzzleDescriptionRequest},this.userVisibleErrorTracker);kpuzzle=new un({puzzleLoader:this.puzzleLoader});puzzleID=new hn({puzzleLoader:this.puzzleLoader});puzzleAlg=new St({algWithIssues:this.alg,kpuzzle:this.kpuzzle});puzzleSetupAlg=new St({algWithIssues:this.setupAlg,kpuzzle:this.kpuzzle});visualizationStrategy=new An({visualizationRequest:this.visualizationFormat,puzzleID:this.puzzleID});indexerConstructor=new rn({alg:this.alg,puzzle:this.puzzleID,visualizationStrategy:this.visualizationStrategy,indexerConstructorRequest:this.indexerConstructorRequest,animationTimelineLeaves:this.animationTimelineLeavesRequest});setupAlgTransformation=new Qr({setupAlg:this.puzzleSetupAlg,kpuzzle:this.kpuzzle});indexer=new an({indexerConstructor:this.indexerConstructor,algWithIssues:this.puzzleAlg,kpuzzle:this.kpuzzle,animationTimelineLeaves:this.animationTimelineLeavesRequest});anchorTransformation=new Hr({setupTransformation:this.setupTransformation,setupAnchor:this.setupAnchor,setupAlgTransformation:this.setupAlgTransformation,indexer:this.indexer});timeRange=new xn({indexer:this.indexer});detailedTimelineInfo=new fn({timestampRequest:this.timestampRequest,timeRange:this.timeRange,setupAnchor:this.setupAnchor,setupAlg:this.setupAlg});coarseTimelineInfo=new gn({detailedTimelineInfo:this.detailedTimelineInfo,playingInfo:this.playingInfo});currentMoveInfo=new Zr({indexer:this.indexer,detailedTimelineInfo:this.detailedTimelineInfo,catchUpMove:this.catchUpMove});buttonAppearance=new Vr({coarseTimelineInfo:this.coarseTimelineInfo,viewerLink:this.viewerLink});currentLeavesSimplified=new Gr({currentMoveInfo:this.currentMoveInfo});currentPattern=new $r({anchoredStart:this.anchorTransformation,currentLeavesSimplified:this.currentLeavesSimplified,indexer:this.indexer});legacyPosition=new sn({currentMoveInfo:this.currentMoveInfo,currentPattern:this.currentPattern});twistySceneModel=new Kn(this);async twizzleLink(){let[e,t,r,n,i,a,s,l]=await Promise.all([this.viewerLink.get(),this.puzzleID.get(),this.puzzleDescriptionRequest.get(),this.alg.get(),this.setupAlg.get(),this.setupAnchor.get(),this.twistySceneModel.stickeringRequest.get(),this.twistySceneModel.twistyPlayerModel.title.get()]),c=e==="experimental-twizzle-explorer",o=new URL(`https://alpha.twizzle.net/${c?"explore":"edit"}/`);return n.alg.experimentalIsEmpty()||o.searchParams.set("alg",n.alg.toString()),i.alg.experimentalIsEmpty()||o.searchParams.set("setup-alg",i.alg.toString()),a!=="start"&&o.searchParams.set("setup-anchor",a),s!=="full"&&s!==null&&o.searchParams.set("experimental-stickering",s),c&&r!==Z?o.searchParams.set("puzzle-description",r):t!=="3x3x3"&&o.searchParams.set("puzzle",t),l&&o.searchParams.set("title",l),o.toString()}experimentalAddAlgLeaf(e,t){let r=e.as(A);r?this.experimentalAddMove(r,t):this.alg.set((async()=>{let i=(await this.alg.get()).alg.concat(new z([e]));return this.timestampRequest.set("end"),i})())}experimentalAddMove(e,t){let r=typeof e=="string"?new A(e):e;this.alg.set((async()=>{let[{alg:n},i]=await Promise.all([this.alg.get(),this.puzzleLoader.get()]),a=xe(n,r,{...t,...await Qe(i)});return this.timestampRequest.set("end"),this.catchUpMove.set({move:r,amount:0}),a})())}experimentalRemoveFinalChild(){this.alg.set((async()=>{let e=(await this.alg.get()).alg,t=Array.from(e.childAlgNodes()),[r]=t.splice(-1);if(!r)return e;this.timestampRequest.set("end");let n=r.as(A);return n&&this.catchUpMove.set({move:n.invert(),amount:0}),new z(t)})())}};function m(e){return new Error(`Cannot get \`.${e}\` directly from a \`TwistyPlayer\`.`)}var ni=class extends P{experimentalModel=new ri;set alg(e){this.experimentalModel.alg.set(e)}get alg(){throw m("alg")}set experimentalSetupAlg(e){this.experimentalModel.setupAlg.set(e)}get experimentalSetupAlg(){throw m("setup")}set experimentalSetupAnchor(e){this.experimentalModel.setupAnchor.set(e)}get experimentalSetupAnchor(){throw m("anchor")}set puzzle(e){this.experimentalModel.puzzleIDRequest.set(e)}get puzzle(){throw m("puzzle")}set experimentalPuzzleDescription(e){this.experimentalModel.puzzleDescriptionRequest.set(e)}get experimentalPuzzleDescription(){throw m("experimentalPuzzleDescription")}set timestamp(e){this.experimentalModel.timestampRequest.set(e)}get timestamp(){throw m("timestamp")}set hintFacelets(e){this.experimentalModel.twistySceneModel.hintFacelet.set(e)}get hintFacelets(){throw m("hintFacelets")}set experimentalStickering(e){this.experimentalModel.twistySceneModel.stickeringRequest.set(e)}get experimentalStickering(){throw m("experimentalStickering")}set experimentalStickeringMaskOrbits(e){this.experimentalModel.twistySceneModel.stickeringMaskRequest.set(e)}get experimentalStickeringMaskOrbits(){throw m("experimentalStickeringMaskOrbits")}set experimentalFaceletScale(e){this.experimentalModel.twistySceneModel.faceletScale.set(e)}get experimentalFaceletScale(){throw m("experimentalFaceletScale")}set backView(e){this.experimentalModel.backView.set(e)}get backView(){throw m("backView")}set background(e){this.experimentalModel.twistySceneModel.background.set(e)}get background(){throw m("background")}set colorScheme(e){this.experimentalModel.twistySceneModel.colorSchemeRequest.set(e)}get colorScheme(){throw m("colorScheme")}set controlPanel(e){this.experimentalModel.controlPanel.set(e)}get controlPanel(){throw m("controlPanel")}set visualization(e){this.experimentalModel.visualizationFormat.set(e)}get visualization(){throw m("visualization")}set experimentalTitle(e){this.experimentalModel.title.set(e)}get experimentalTitle(){throw m("experimentalTitle")}set experimentalVideoURL(e){this.experimentalModel.videoURL.set(e)}get experimentalVideoURL(){throw m("experimentalVideoURL")}set experimentalCompetitionID(e){this.experimentalModel.competitionID.set(e)}get experimentalCompetitionID(){throw m("experimentalCompetitionID")}set viewerLink(e){this.experimentalModel.viewerLink.set(e)}get viewerLink(){throw m("viewerLink")}set experimentalMovePressInput(e){this.experimentalModel.twistySceneModel.movePressInput.set(e)}get experimentalMovePressInput(){throw m("experimentalMovePressInput")}set experimentalMovePressCancelOptions(e){this.experimentalModel.twistySceneModel.movePressCancelOptions.set(e)}get experimentalMovePressCancelOptions(){throw m("experimentalMovePressCancelOptions")}set cameraLatitude(e){this.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set({latitude:e})}get cameraLatitude(){throw m("cameraLatitude")}set cameraLongitude(e){this.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set({longitude:e})}get cameraLongitude(){throw m("cameraLongitude")}set cameraDistance(e){this.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set({distance:e})}get cameraDistance(){throw m("cameraDistance")}set cameraLatitudeLimit(e){this.experimentalModel.twistySceneModel.latitudeLimit.set(e)}get cameraLatitudeLimit(){throw m("cameraLatitudeLimit")}set indexer(e){this.experimentalModel.indexerConstructorRequest.set(e)}get indexer(){throw m("indexer")}set tempoScale(e){this.experimentalModel.tempoScale.set(e)}get tempoScale(){throw m("tempoScale")}set experimentalSprite(e){this.experimentalModel.twistySceneModel.foundationStickerSpriteURL.set(e)}get experimentalSprite(){throw m("experimentalSprite")}set experimentalHintSprite(e){this.experimentalModel.twistySceneModel.hintStickerSpriteURL.set(e)}get experimentalHintSprite(){throw m("experimentalHintSprite")}set fullscreenElement(e){this.experimentalModel.twistySceneModel.fullscreenElement.set(e)}get fullscreenElement(){throw m("fullscreenElement")}set experimentalInitialHintFaceletsAnimation(e){this.experimentalModel.twistySceneModel.initialHintFaceletsAnimation.set(e)}get experimentalInitialHintFaceletsAnimation(){throw m("experimentalInitialHintFaceletsAnimation")}set experimentalHintFaceletsElevation(e){this.experimentalModel.twistySceneModel.hintFaceletsElevation.set(e)}get experimentalHintFaceletsElevation(){throw m("experimentalHintFaceletsElevation")}set experimentalDragInput(e){this.experimentalModel.twistySceneModel.dragInput.set(e)}get experimentalDragInput(){throw m("experimentalDragInput")}experimentalGet=new ii(this.experimentalModel)},ii=class{model;constructor(e){this.model=e}async alg(){return(await this.model.alg.get()).alg}async setupAlg(){return(await this.model.setupAlg.get()).alg}puzzleID(){return this.model.puzzleID.get()}async timestamp(){return(await this.model.detailedTimelineInfo.get()).timestamp}},De="data-",ve={alg:"alg","experimental-setup-alg":"experimentalSetupAlg","experimental-setup-anchor":"experimentalSetupAnchor",puzzle:"puzzle","experimental-puzzle-description":"experimentalPuzzleDescription",visualization:"visualization","hint-facelets":"hintFacelets","experimental-stickering":"experimentalStickering","experimental-stickering-mask-orbits":"experimentalStickeringMaskOrbits",background:"background","color-scheme":"colorScheme","control-panel":"controlPanel","back-view":"backView","experimental-facelet-scale":"experimentalFaceletScale","experimental-initial-hint-facelets-animation":"experimentalInitialHintFaceletsAnimation","experimental-hint-facelets-elevation":"experimentalHintFaceletsElevation","viewer-link":"viewerLink","experimental-move-press-input":"experimentalMovePressInput","experimental-drag-input":"experimentalDragInput","experimental-title":"experimentalTitle","experimental-video-url":"experimentalVideoURL","experimental-competition-id":"experimentalCompetitionID","camera-latitude":"cameraLatitude","camera-longitude":"cameraLongitude","camera-distance":"cameraDistance","camera-latitude-limit":"cameraLatitudeLimit","tempo-scale":"tempoScale","experimental-sprite":"experimentalSprite","experimental-hint-sprite":"experimentalHintSprite"},ai=Object.fromEntries(Object.values(ve).map(e=>[e,!0])),si={experimentalMovePressCancelOptions:!0},Lt,Kt=Symbol("intersectedCallback");function oi(e){Lt??=new IntersectionObserver((t,r)=>{for(let n of t)n.isIntersecting&&n.intersectionRect.height>0&&(n.target[Kt](),r.unobserve(n.target))}),Lt.observe(e)}var K=class extends ni{controller=new Er(this.experimentalModel,this);buttons;experimentalCanvasClickCallback=()=>{};constructor(e={}){super();for(let[t,r]of Object.entries(e)){if(!(ai[t]||si[t])){console.warn(`Invalid config passed to TwistyPlayer: ${t}`);break}this[t]=r}}#e=new ae(this,"controls-",["auto"].concat(Object.keys(Pr)));#r=document.createElement("div");#t=document.createElement("div");#i=!1;connectedCallback(){this.addCSS(Zt),oi(this)}async[Kt](){if(this.#i)return;this.#i=!0,this.addElement(this.#r).classList.add("visualization-wrapper"),this.addElement(this.#t).classList.add("error-elem"),this.#t.textContent="Error",this.experimentalModel.userVisibleErrorTracker.addFreshListener(t=>{let r=t.errors[0]??null;this.contentWrapper.classList.toggle("error",!!r),r&&(this.#t.textContent=r)});let e=new Yt(this.experimentalModel,this.controller);this.contentWrapper.appendChild(e),this.buttons=new qt(this.experimentalModel,this.controller,this),this.contentWrapper.appendChild(this.buttons),this.experimentalModel.twistySceneModel.background.addFreshListener(t=>{this.contentWrapper.classList.toggle("checkered",["auto","checkered"].includes(t)),this.contentWrapper.classList.toggle("checkered-transparent",t==="checkered-transparent")}),this.experimentalModel.twistySceneModel.colorScheme.addFreshListener(t=>{this.contentWrapper.classList.toggle("dark-mode",["dark"].includes(t))}),this.experimentalModel.controlPanel.addFreshListener(t=>{this.#e.setValue(t)}),this.experimentalModel.visualizationStrategy.addFreshListener(this.#l.bind(this)),this.experimentalModel.puzzleID.addFreshListener(this.flash.bind(this))}#a="auto";experimentalSetFlashLevel(e){this.#a=e}flash(){this.#a==="auto"&&this.#n?.animate([{opacity:.25},{opacity:1}],{duration:250,easing:"ease-out"})}#n=null;#s=new jt;#o=null;#l(e){if(e!==this.#o){this.#n?.remove(),this.#n?.disconnect();let t;switch(e){case"2D":case"experimental-2D-LL":case"experimental-2D-LL-face":{t=new Ft(this.experimentalModel.twistySceneModel,e);break}case"Cube3D":case"PG3D":{t=new Pe(this.experimentalModel),this.#s.handleNewValue(t);break}default:throw new Error("Invalid visualization")}this.#r.appendChild(t),this.#n=t,this.#o=e}}async experimentalCurrentVantages(){this.connectedCallback();let e=this.#n;return e instanceof Pe?e.experimentalVantages():[]}async experimentalCurrentCanvases(){let e=await this.experimentalCurrentVantages(),t=[];for(let r of e)t.push((await r.canvasInfo()).canvas);return t}async experimentalCurrentThreeJSPuzzleObject(e){this.connectedCallback();let r=await(await this.#s.promise).experimentalTwisty3DPuzzleWrapper(),n=r.twisty3DPuzzle(),i=(async()=>{await n,await new Promise(a=>setTimeout(a,0))})();if(e){let a=new te(async()=>{});r.addEventListener("render-scheduled",async()=>{a.requestIsPending()||(a.requestAnimFrame(),await i,e())})}return n}jumpToStart(e){this.controller.jumpToStart(e)}jumpToEnd(e){this.controller.jumpToEnd(e)}play(){this.controller.togglePlay(!0)}pause(){this.controller.togglePlay(!1)}togglePlay(e){this.controller.togglePlay(e)}experimentalAddMove(e,t){this.experimentalModel.experimentalAddMove(e,t)}experimentalAddAlgLeaf(e,t){this.experimentalModel.experimentalAddAlgLeaf(e,t)}static get observedAttributes(){let e=[];for(let t of Object.keys(ve))e.push(t,De+t);return e}experimentalRemoveFinalChild(){this.experimentalModel.experimentalRemoveFinalChild()}attributeChangedCallback(e,t,r){e.startsWith(De)&&(e=e.slice(De.length));let n=ve[e];n&&(this[n]=r)}async experimentalScreenshot(e){return(await xt(this.experimentalModel,e)).dataURL}async experimentalDownloadScreenshot(e){if(["2D","experimental-2D-LL","experimental-2D-LL-face"].includes(await this.experimentalModel.visualizationStrategy.get())){let r=await this.#n.currentTwisty2DPuzzleWrapper().twisty2DPuzzle(),n=new XMLSerializer().serializeToString(r.svgWrapper.svgElement),i=URL.createObjectURL(new Blob([n]));Gt(i,e??await _t(this.experimentalModel),"svg")}else await(await xt(this.experimentalModel)).download(e)}};b.define("twisty-player",K);var li=class extends ee{traverseAlg(e,t){let r=[],n=0;for(let i of e.childAlgNodes()){let a=this.traverseAlgNode(i,{numMovesSoFar:t.numMovesSoFar+n});r.push(a.tokens),n+=a.numLeavesInside}return{tokens:Array.prototype.concat(...r),numLeavesInside:n}}traverseGrouping(e,t){let r=this.traverseAlg(e.alg,t);return{tokens:r.tokens,numLeavesInside:r.numLeavesInside*e.amount}}traverseMove(e,t){return{tokens:[{leaf:e,idx:t.numMovesSoFar}],numLeavesInside:1}}traverseCommutator(e,t){let r=this.traverseAlg(e.A,t),n=this.traverseAlg(e.B,{numMovesSoFar:t.numMovesSoFar+r.numLeavesInside});return{tokens:r.tokens.concat(n.tokens),numLeavesInside:r.numLeavesInside*2+n.numLeavesInside}}traverseConjugate(e,t){let r=this.traverseAlg(e.A,t),n=this.traverseAlg(e.B,{numMovesSoFar:t.numMovesSoFar+r.numLeavesInside});return{tokens:r.tokens.concat(n.tokens),numLeavesInside:r.numLeavesInside*2+n.numLeavesInside*2}}traversePause(e,t){return{tokens:[{leaf:e,idx:t.numMovesSoFar}],numLeavesInside:1}}traverseNewline(e,t){return{tokens:[],numLeavesInside:0}}traverseLineComment(e,t){return{tokens:[],numLeavesInside:0}}},ci=S(li),ui=class extends p{getDefaultValue(){return""}},di=class extends f{derive(e){return Xt(e.value)}},hi=class extends B{getDefaultValue(){return{selectionStart:0,selectionEnd:0,endChangedMostRecently:!1}}async derive(e,t){let{selectionStart:r,selectionEnd:n}=e,i=await t,a=e.selectionStart===i.selectionStart&&e.selectionEnd!==(await t).selectionEnd;return{selectionStart:r,selectionEnd:n,endChangedMostRecently:a}}},mi=class extends f{derive(e){return e.selectionInfo.endChangedMostRecently?e.selectionInfo.selectionEnd:e.selectionInfo.selectionStart}},pi=class extends f{derive(e){return ci(e.algWithIssues.alg,{numMovesSoFar:0}).tokens}},gi=class extends f{derive(e){function t(n){if(n===null)return null;let i;return e.targetChar<n.leaf[j]?i="before":e.targetChar===n.leaf[j]?i="start":e.targetChar<n.leaf[_]?i="inside":e.targetChar===n.leaf[_]?i="end":i="after",{leafInfo:n,where:i}}let r=null;for(let n of e.leafTokens){if(e.targetChar<n.leaf[j]&&r!==null)return t(r);if(e.targetChar<=n.leaf[_])return t(n);r=n}return t(r)}},fi=class{valueProp=new ui;selectionProp=new hi;targetCharProp=new mi({selectionInfo:this.selectionProp});algEditorAlgWithIssues=new di({value:this.valueProp});leafTokensProp=new pi({algWithIssues:this.algEditorAlgWithIssues});leafToHighlight=new gi({leafTokens:this.leafTokensProp,targetChar:this.targetCharProp})},vi="//";function wi(e){try{return z.fromString(e)}catch{return null}}function er(e,t){let r=e.indexOf(t);return r===-1?[e,""]:[e.slice(0,r),e.slice(r)]}function Dt(e){let t=[];for(let r of e.split(`
`)){let[n,i]=er(r,vi);n=n.replaceAll("\u2019","'"),t.push(n+i)}return t.join(`
`)}function Mi(e,t){let{value:r}=e,{selectionStart:n,selectionEnd:i}=e,a=r.slice(0,n),s=r.slice(i);t=t.replaceAll(`\r
`,`
`);let l=a.match(/\/\/[^\n]*$/),c=r[n-1]==="/"&&t[0]==="/",o=l||c,d=t.match(/\/\/[^\n]*$/),u=t;if(o){let[T,L]=er(t,`
`);u=T+Dt(L)}else u=Dt(t);let h=!o&&n!==0&&![`
`," "].includes(u[0])&&![`
`," "].includes(r[n-1]),g=!d&&i!==r.length&&![`
`," "].includes(u.at(-1))&&![`
`," "].includes(r[i]);function M(T,L){let D=T+u+L,R=!!wi(a+D+s);return R&&(u=D),R}h&&g&&M(" "," ")||h&&M(" ","")||g&&M(""," "),W?.execCommand("insertText",!1,u)||e.setRangeText(u,n,i,"end")}var tr=new E;tr.replaceSync(`
:host {
  width: 384px;
  display: grid;
}

.wrapper {
  /*overflow: hidden;
  resize: horizontal;*/

  background: var(--background, none);
  display: grid;
}

textarea, .carbon-copy {
  grid-area: 1 / 1 / 2 / 2;

  width: 100%;
  font-family: sans-serif;
  line-height: 1.2em;

  font-size: var(--font-size, inherit);
  font-family: var(--font-family, sans-serif);

  box-sizing: border-box;

  padding: var(--padding, 0.5em);
  /* Prevent horizontal growth. */
  overflow-x: hidden;
}

textarea {
  resize: none;
  background: none;
  z-index: 2;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.25));
  overflow: hidden;
}

.carbon-copy {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: transparent;
  user-select: none;
  pointer-events: none;

  z-index: 1;
}

.carbon-copy .highlight {
  background: var(--highlight-color, rgba(255, 128, 0, 0.5));
  padding: 0.1em 0.2em;
  margin: -0.1em -0.2em;
  border-radius: 0.2em;
}

.wrapper.issue-warning textarea,
.wrapper.valid-for-puzzle-warning textarea {
  outline: none;
  border: 1px solid rgba(200, 200, 0, 0.5);
  background: rgba(255, 255, 0, 0.1);
}

.wrapper.issue-error textarea,
.wrapper.valid-for-puzzle-error textarea {
  outline: none;
  border: 1px solid red;
  background: rgba(255, 0, 0, 0.1);
}
`);var de="for-twisty-player",Ct="placeholder",Et="twisty-player-prop",yi=class extends P{model=new fi;#e=document.createElement("textarea");#r=document.createElement("div");#t=document.createElement("span");#i=document.createElement("span");#a=document.createElement("span");#n=new ae(this,"valid-for-puzzle-",["none","warning","error"]);#s=null;#o;get#l(){return this.#s===null?null:this.#s.experimentalModel[this.#o]}debugNeverRequestTimestamp=!1;constructor(e){super(),this.#r.classList.add("carbon-copy"),this.addElement(this.#r),this.#e.rows=1,this.addElement(this.#e),this.#t.classList.add("prefix"),this.#r.appendChild(this.#t),this.#i.classList.add("highlight"),this.#r.appendChild(this.#i),this.#a.classList.add("suffix"),this.#r.appendChild(this.#a),this.#e.placeholder="Alg",this.#e.setAttribute("spellcheck","false"),this.addCSS(tr),this.#e.addEventListener("input",()=>{this.#c=!0,this.onInput()}),this.#e.addEventListener("blur",()=>this.onBlur()),document.addEventListener("selectionchange",()=>this.onSelectionChange()),e?.twistyPlayer&&(this.twistyPlayer=e.twistyPlayer),this.#o=e?.twistyPlayerProp??"alg",e?.twistyPlayerProp==="alg"&&this.model.leafToHighlight.addFreshListener(t=>{t&&this.highlightLeaf(t.leafInfo.leaf)})}connectedCallback(){this.#e.addEventListener("paste",e=>{let t=e.clipboardData?.getData("text");t&&(Mi(this.#e,t),e.preventDefault(),this.onInput())})}set algString(e){this.#e.value=e,this.onInput()}get algString(){return this.#e.value}set placeholder(e){this.#e.placeholder=e}#c=!1;onInput(){this.#i.hidden=!0,this.highlightLeaf(null);let e=this.#e.value.trimEnd();this.model.valueProp.set(e),this.#l?.set(e)}async onSelectionChange(){if(document.activeElement!==this||this.shadow.activeElement!==this.#e||this.#o!=="alg")return;let{selectionStart:e,selectionEnd:t}=this.#e;this.model.selectionProp.set({selectionStart:e,selectionEnd:t})}async onBlur(){}setAlgIssueClassForPuzzle(e){this.#n.setValue(e)}#u(e){return e.endsWith(`
`)?`${e} `:e}#d=null;highlightLeaf(e){if(e===null){this.#t.textContent="",this.#i.textContent="",this.#a.textContent=this.#u(this.#e.value);return}e!==this.#d&&(this.#d=e,this.#t.textContent=this.#e.value.slice(0,e[j]),this.#i.textContent=this.#e.value.slice(e[j],e[_]),this.#a.textContent=this.#u(this.#e.value.slice(e[_])),this.#i.hidden=!1)}get twistyPlayer(){return this.#s}set twistyPlayer(e){if(this.#s){console.warn("twisty-player reassignment/clearing is not supported");return}this.#s=e,e&&((async()=>this.algString=this.#l?(await this.#l.get()).alg.toString():"")(),this.#o==="alg"&&(this.#s?.experimentalModel.puzzleAlg.addFreshListener(t=>{if(t.issues.errors.length===0){this.setAlgIssueClassForPuzzle(t.issues.warnings.length===0?"none":"warning");let r=t.alg,n=z.fromString(this.algString);r.isIdentical(n)||(this.algString=r.toString(),this.onInput())}else this.setAlgIssueClassForPuzzle("error")}),this.model.leafToHighlight.addFreshListener(async t=>{if(t===null)return;let[r,n]=await Promise.all([await e.experimentalModel.indexer.get(),await e.experimentalModel.timestampRequest.get()]);if(n==="auto"&&!this.#c)return;let i=r.indexToMoveStartTimestamp(t.leafInfo.idx),a=r.moveDuration(t.leafInfo.idx),s;switch(t.where){case"before":{s=i;break}case"start":case"inside":{s=i+a/4;break}case"end":case"after":{s=i+a;break}default:throw console.log("invalid where"),new Error("Invalid where!")}this.debugNeverRequestTimestamp||e.experimentalModel.timestampRequest.set(s)}),e.experimentalModel.currentLeavesSimplified.addFreshListener(async t=>{let n=(await e.experimentalModel.indexer.get()).getAnimLeaf(t.patternIndex);this.highlightLeaf(n)})))}attributeChangedCallback(e,t,r){switch(e){case de:{let n=document.getElementById(r);if(!n){console.warn(`${de}= elem does not exist`);return}if(!(n instanceof K)){console.warn(`${de}=is not a twisty-player`);return}this.twistyPlayer=n;return}case Ct:{this.placeholder=r;return}case Et:{if(this.#s)throw console.log("cannot set prop"),new Error("cannot set prop after twisty player");this.#o=r;return}}}static get observedAttributes(){return[de,Ct,Et]}};b.define("twisty-alg-editor",yi);async function xi(e){return new Promise((t,r)=>{try{let n=document.getElementById(e);n&&t(n);let i=new MutationObserver(a=>{for(let s of a)s.attributeName==="id"&&s.target instanceof Element&&s.target.getAttribute("id")===e&&(t(s.target),i.disconnect())});i.observe(document.body,{attributeFilter:["id"],subtree:!0})}catch(n){r(n)}})}var rr=new E;rr.replaceSync(`
:host {
  display: inline;
  --comment-opacity: 0.4;
  --active-background-shade: rgba(66, 133, 244);
}

.wrapper {
  display: inline;
  --current-color: currentColor
}

a {
  color: currentColor;

  &:not(:hover) {
    text-decoration: none;
  }

  &:hover {
    background: color-mix(in oklab, currentColor 20%, transparent);
  }

  &:active {
    color: currentColor;
    animation: 1s linear flash;
  }
}

@keyframes flash {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

twisty-alg-leaf-elem.twisty-alg-line-comment {
  opacity: var(--comment-opacity);
}

.current-move {
  background: color-mix(in oklab, var(--active-background-shade) 30%, transparent);
  margin-left: -0.1em;
  margin-right: -0.1em;
  padding-left: 0.1em;
  padding-right: 0.1em;
  border-radius: 0.1em;
}
`);var zi=.25,X=class extends Se{algOrAlgNode;constructor(e,t,r,n,i,a){if(super(),this.algOrAlgNode=n,this.classList.add(e),a){let s=this.appendChild(document.createElement("a"));s.href="#",s.textContent=t,s.addEventListener("click",l=>{l.preventDefault(),r.twistyAlgViewer.jumpToIndex(r.earliestMoveIndex,i)})}else this.appendChild(document.createElement("span")).textContent=t}pathToIndex(e){return[]}setCurrentMove(e){this.classList.toggle("current-move",e)}};b.define("twisty-alg-leaf-elem",X);var J=class extends Se{queue=[];algOrAlgNode;constructor(e,t){super(),this.algOrAlgNode=t,this.classList.add(e)}addString(e){let t=document.createElement("span");t.textContent=e,this.queue.push(t)}addElem(e){return this.queue.push(e.element),e.moveCount}flushQueue(e=O.Forwards){for(let t of nr(this.queue,e))this.append(t);this.queue=[]}pathToIndex(e){return[]}};b.define("twisty-alg-wrapper-elem",J);function Ti(e){return e===O.Forwards?O.Backwards:O.Forwards}function Ai(e,t){return t<0?Ti(e):e}function nr(e,t){if(t===O.Forwards)return e;let r=Array.from(e);return r.reverse(),r}var Si=class extends ee{traverseAlg(e,t){let r=0,n=new J("twisty-alg-alg",e),i=!0;for(let a of Ve(e.childAlgNodes(),t.direction))i||n.addString(" "),i=!1,a.as(ce)?.experimentalNISSGrouping&&n.addString("^("),a.as(G)?.experimentalNISSPlaceholder||(r+=n.addElem(this.traverseAlgNode(a,{earliestMoveIndex:t.earliestMoveIndex+r,twistyAlgViewer:t.twistyAlgViewer,direction:t.direction}))),a.as(ce)?.experimentalNISSGrouping&&n.addString(")");return n.flushQueue(t.direction),{moveCount:r,element:n}}traverseGrouping(e,t){let r=e.experimentalAsSquare1Tuple(),n=Ai(t.direction,e.amount),i=0,a=new J("twisty-alg-grouping",e);return a.addString("("),r?(i+=a.addElem({moveCount:1,element:new X("twisty-alg-move",r[0].amount.toString(),t,r[0],!0,!0)}),a.addString(", "),i+=a.addElem({moveCount:1,element:new X("twisty-alg-move",r[1].amount.toString(),t,r[1],!0,!0)})):i+=a.addElem(this.traverseAlg(e.alg,{earliestMoveIndex:t.earliestMoveIndex+i,twistyAlgViewer:t.twistyAlgViewer,direction:n})),a.addString(`)${e.experimentalRepetitionSuffix}`),a.flushQueue(),{moveCount:i*Math.abs(e.amount),element:a}}traverseMove(e,t){let r=new X("twisty-alg-move",e.toString(),t,e,!0,!0);return t.twistyAlgViewer.highlighter.addMove(e[j],r),{moveCount:1,element:r}}traverseCommutator(e,t){let r=0,n=new J("twisty-alg-commutator",e);n.addString("["),n.flushQueue();let[i,a]=nr([e.A,e.B],t.direction);return r+=n.addElem(this.traverseAlg(i,{earliestMoveIndex:t.earliestMoveIndex+r,twistyAlgViewer:t.twistyAlgViewer,direction:t.direction})),n.addString(", "),r+=n.addElem(this.traverseAlg(a,{earliestMoveIndex:t.earliestMoveIndex+r,twistyAlgViewer:t.twistyAlgViewer,direction:t.direction})),n.flushQueue(t.direction),n.addString("]"),n.flushQueue(),{moveCount:r*2,element:n}}traverseConjugate(e,t){let r=0,n=new J("twisty-alg-conjugate",e);n.addString("[");let i=n.addElem(this.traverseAlg(e.A,{earliestMoveIndex:t.earliestMoveIndex+r,twistyAlgViewer:t.twistyAlgViewer,direction:t.direction}));return r+=i,n.addString(": "),r+=n.addElem(this.traverseAlg(e.B,{earliestMoveIndex:t.earliestMoveIndex+r,twistyAlgViewer:t.twistyAlgViewer,direction:t.direction})),n.addString("]"),n.flushQueue(),{moveCount:r+i,element:n}}traversePause(e,t){return e.experimentalNISSGrouping?this.traverseAlg(e.experimentalNISSGrouping.alg,t):{moveCount:1,element:new X("twisty-alg-pause",".",t,e,!0,!0)}}traverseNewline(e,t){let r=new J("twisty-alg-newline",e);return r.append(document.createElement("br")),{moveCount:0,element:r}}traverseLineComment(e,t){return{moveCount:0,element:new X("twisty-alg-line-comment",`//${e.text}`,t,e,!1,!1)}}},bi=S(Si),ki=class{moveCharIndexMap=new Map;currentElem=null;addMove(e,t){this.moveCharIndexMap.set(e,t)}set(e){let t=e?this.moveCharIndexMap.get(e[j])??null:null;this.currentElem!==t&&(this.currentElem?.setCurrentMove(!1),t?.setCurrentMove(!0),this.currentElem=t)}},ir=class extends P{highlighter=new ki;#e;#r;#t=null;lastClickTimestamp=null;constructor(e){super({mode:"open"}),this.addCSS(rr),e?.twistyPlayer&&(this.twistyPlayer=e?.twistyPlayer)}connectedCallback(){}setAlg(e){this.#r?.isIdentical(e)||(this.#e=bi(e,{earliestMoveIndex:0,twistyAlgViewer:this,direction:O.Forwards}).element,this.#r=e,this.contentWrapper.textContent="",this.contentWrapper.appendChild(this.#e))}get twistyPlayer(){return this.#t}set twistyPlayer(e){this.#i(e)}async#i(e){if(this.#t){console.warn("twisty-player reassignment is not supported");return}if(e===null)throw new Error("clearing twistyPlayer is not supported");this.#t=e,this.#t.experimentalModel.alg.addFreshListener(t=>{this.setAlg(t.alg)}),e.experimentalModel.currentMoveInfo.addFreshListener(t=>{let r=t.currentMoves[0];if(r??=t.movesStarting[0],r??=t.movesFinishing[0],!r)this.highlighter.set(null);else{let n=r.move;this.highlighter.set(n)}}),e.experimentalModel.detailedTimelineInfo.addFreshListener(t=>{t.timestamp!==this.lastClickTimestamp&&(this.lastClickTimestamp=null)})}async jumpToIndex(e,t){let r=this.#t;if(r){r.pause();let n=(async()=>{let i=await r.experimentalModel.indexer.get(),a=t?i.moveDuration(e)*zi:0;return i.indexToMoveStartTimestamp(e)+i.moveDuration(e)-a})();r.experimentalModel.timestampRequest.set(await n),this.lastClickTimestamp===await n?(r.play(),this.lastClickTimestamp=null):this.lastClickTimestamp=await n}}async attributeChangedCallback(e,t,r){if(e==="for"){let n=document.getElementById(r);if(n||console.info("for= elem does not exist, waiting for one"),await customElements.whenDefined("twisty-player"),n=await xi(r),!(n instanceof K)){console.warn("for= elem is not a twisty-player");return}this.twistyPlayer=n}}static get observedAttributes(){return["for"]}};b.define("twisty-alg-viewer",ir);var ge=new E;ge.replaceSync(`
.wrapper {
  background: rgb(255, 245, 235);
  border: 1px solid rgba(0, 0, 0, 0.25);

  /* Workaround from https://stackoverflow.com/questions/40010597/how-do-i-apply-opacity-to-a-css-color-variable */
  --text-color: 0, 0, 0;
  --heading-background: 255, 230, 210;

  color: rgb(var(--text-color));
}

.setup-alg, twisty-alg-viewer {
  padding: 0.5em 1em;
}

.heading {
  background: rgba(var(--heading-background), 1);
  color: rgba(var(--text-color), 1);
  font-weight: bold;
  padding: 0.25em 0.5em;
  display: grid;
  grid-template-columns: auto 1fr;

  /* For the move count hover elems. */
  position: sticky;
}

.heading.title {
  background: rgb(255, 245, 235);
  font-size: 150%;
  white-space: pre-wrap;
}

.heading .move-count {
  font-weight: initial;
  text-align: right;
  color: rgba(var(--text-color), 0.4);
}

.wrapper.dark-mode .heading .move-count {
  color: rgba(var(--text-color), 0.7);
}

.heading a {
  text-decoration: none;
  color: inherit;
}

twisty-player {
  width: 100%;
  min-height: 128px;
  height: 288px;
  resize: vertical;
  overflow-y: hidden;
}

twisty-player + .heading {
  padding-top: 0.5em;
}

twisty-alg-viewer {
  display: inline-block;
}

.wrapper {
  container-type: inline-size;
}

.scrollable-region {
  border-top: 1px solid rgba(0, 0, 0, 0.25);
}

.scrollable-region {
  max-height: 18em;
  overflow-y: auto;
}

@container (min-width: 512px) {
  .responsive-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  twisty-player {
    height: 320px
  }
  .scrollable-region {
    border-top: none;
    border-left: 1px solid rgba(0, 0, 0, 0.25);
    contain: strict;
    max-height: 100cqh;
  }
}

.wrapper:fullscreen,
.wrapper:fullscreen .responsive-wrapper {
  width: 100%;
  height: 100%;
}

.wrapper:fullscreen twisty-player,
.wrapper:fullscreen .scrollable-region {
  height: 50%;
}

@container (min-width: 512px) {
  .wrapper:fullscreen twisty-player,
  .wrapper:fullscreen .scrollable-region {
    height: 100%;
  }
}

/* TODO: dedup with Twizzle Editor */
.move-count > span:hover:before {
  background-color: rgba(var(--heading-background), 1);
  color: rgba(var(--text-color), 1);
  backdrop-filter: blur(4px);
  z-index: 100;
  position: absolute;
  padding: 0.5em;
  top: 1.5em;
  right: 0;
  content: attr(data-before);
  white-space: pre-wrap;
  text-align: left;
}

.move-count > span:hover {
  color: rgba(var(--text-color), 1);
  cursor: help;
}
`);var ar=new E;ar.replaceSync(`
.wrapper {
  background: white;
  --heading-background: 232, 239, 253
}

.wrapper.dark-mode {
  --text-color: 236, 236, 236;
  --heading-background: 29, 29, 29;
}

.scrollable-region {
  overflow-y: auto;
}

.wrapper.dark-mode {
  background: #262626;
  --text-color: 142, 142, 142;
  border-color: #FFFFFF44;
}

.wrapper.dark-mode .heading:not(.title) {
  background: #1d1d1d;
}

.heading.title {
  background: none;
}
`);function Ii(e="",t=location.href){let r={alg:"alg","setup-alg":"experimental-setup-alg","setup-anchor":"experimental-setup-anchor",puzzle:"puzzle",stickering:"experimental-stickering","puzzle-description":"experimental-puzzle-description",title:"experimental-title","video-url":"experimental-video-url",competition:"experimental-competition-id"},n=new URL(t).searchParams,i={};for(let[a,s]of Object.entries(r)){let l=n.get(e+a);if(l!==null){let c=ve[s];i[c]=l}}return i}var he="outer block moves (e.g. R, Rw, or 4r)",me="inner block moves (e.g. M or 2-5r)",Pt={[v.OuterBlockTurnMetric]:`HTM = OBTM ("Outer Block Turn Metric"):
\u2022 ${me} count as 2 turns
\u2022 ${he} count as 1 turn
\u2022 rotations (e.g. x) count as 0 turns`,[v.OuterBlockQuantumTurnMetric]:`QTM = OBQTM ("Outer Block Quantum Turn Metric"):
\u2022 ${me} count as 2 turns per quantum (e.g. M2 counts as 4)
\u2022 ${he} count as 1 turn per quantum (e.g. R2 counts as 2)
\u2022 rotations (e.g. x) count as 0 turns`,[v.RangeBlockTurnMetric]:`STM = RBTM ("Range Block Turn Metric"):
\u2022 ${me} count as 1 turn
\u2022 ${he} count as 1 turn
\u2022 rotations (e.g. x) count as 0 turns`,[v.RangeBlockQuantumTurnMetric]:`SQTM = RBQTM ("Range Block Quantum Turn Metric"):
\u2022 ${me} count as 1 turn per quantum (e.g. M2 counts as 2)
\u2022 ${he} count as 1 turn per quantum (e.g. R2 counts as 2)
\u2022 rotations (e.g. x) count as 0 turns`,[v.ExecutionTurnMetric]:`ETM ("Execution Turn Metric"):
\u2022 all moves (including rotations) count as 1 turn`},Li={[v.OuterBlockTurnMetric]:"OB",[v.OuterBlockQuantumTurnMetric]:"OBQ",[v.RangeBlockTurnMetric]:"RB",[v.RangeBlockQuantumTurnMetric]:"RBQ",[v.ExecutionTurnMetric]:"E"},Di=class extends P{twistyPlayer=null;a=null;options;constructor(e){super({mode:"open"}),this.options=e}#e(){if(this.contentWrapper.textContent="",this.a){let t=this.contentWrapper.appendChild(document.createElement("span"));t.textContent="\u2757\uFE0F",t.title="Could not show a player for link",this.addElement(this.a)}this.removeCSS(ge);let e=this.shadow.adoptedStyleSheets.indexOf(ge);typeof e<"u"&&this.shadow.adoptedStyleSheets.splice(e,e+1),this.#r?.remove()}#r;#t;#i;#a;async connectedCallback(){if(this.#i=this.addElement(document.createElement("div")),this.#i.classList.add("responsive-wrapper"),this.options?.colorScheme==="dark"&&this.contentWrapper.classList.add("dark-mode"),this.addCSS(ge),this.options?.cdnForumTweaks&&this.addCSS(ar),this.a=this.querySelector("a"),!this.a)return;let e=Ii("",this.a.href),t=this.a?.href,{hostname:r,pathname:n}=new URL(t);if(r!=="alpha.twizzle.net"){this.#e();return}if(["/edit/","/explore/"].includes(n)){let i=n==="/explore/";if(e.puzzle&&!(e.puzzle in F)){let l=(await import("./chunks/puzzle-geometry-BUJKA7FL.js")).getPuzzleDescriptionString(e.puzzle);delete e.puzzle,e.experimentalPuzzleDescription=l}if(this.twistyPlayer=this.#i.appendChild(new K({background:this.options?.cdnForumTweaks?"checkered-transparent":"checkered",colorScheme:this.options?.colorScheme==="dark"?"dark":"light",...e,viewerLink:i?"experimental-twizzle-explorer":"auto"})),this.twistyPlayer.fullscreenElement=this.contentWrapper,e.experimentalTitle&&(this.twistyPlayer.experimentalTitle=e.experimentalTitle),this.#t=this.#i.appendChild(document.createElement("div")),this.#t.classList.add("scrollable-region"),e.experimentalTitle&&this.#n(e.experimentalTitle).classList.add("title"),e.experimentalSetupAlg){this.#n("Setup",async()=>(await this.twistyPlayer?.experimentalModel.setupAlg.get())?.alg.toString()??null);let l=this.#t.appendChild(document.createElement("div"));l.classList.add("setup-alg"),l.textContent=new z(e.experimentalSetupAlg).toString()}let a=this.#n("Moves",async()=>(await this.twistyPlayer?.experimentalModel.alg.get())?.alg.toString()??null);this.#a=a.appendChild(Ci(this.twistyPlayer.experimentalModel)),this.#a.classList.add("move-count"),this.#t.appendChild(new ir({twistyPlayer:this.twistyPlayer})).part.add("twisty-alg-viewer")}else this.#e()}#n(e,t){let r=this.#t.appendChild(document.createElement("div"));r.classList.add("heading");let n=r.appendChild(document.createElement("span"));if(n.textContent=e,t){n.textContent+=" ";let i=n.appendChild(document.createElement("a"));i.textContent="\u{1F4CB}",i.href="#",i.title="Copy to clipboard";async function a(s){i.textContent=s,await new Promise(l=>setTimeout(l,2e3)),i.textContent===s&&(i.textContent="\u{1F4CB}")}i.addEventListener("click",async s=>{s.preventDefault(),i.textContent="\u{1F4CB}\u2026";let l=await t();if(l)try{await navigator.clipboard.writeText(l),a("\u{1F4CB}\u2705")}catch(c){throw a("\u{1F4CB}\u274C"),c}else a("\u{1F4CB}\u274C")})}return r}};b.define("twizzle-link",Di);function Ci(e,t=document.createElement("span")){async function r(){let[n,i]=await Promise.all([e.puzzleAlg.get(),e.puzzleLoader.get()]);if(n.issues.errors.length!==0){t.textContent="";return}let a=!0;function s(l){a?a=!1:t.append(")(");let c=t.appendChild(document.createElement("span")),o=ht(i,l,n.alg);c.append(`${Li[l]}: `);let d=c.appendChild(document.createElement("span"));d.textContent=o.toString(),d.classList.add("move-number"),c.setAttribute("data-before",Pt[l]??""),c.setAttribute("title",Pt[l]??"")}t.textContent="(",i.id==="3x3x3"?(s(v.OuterBlockTurnMetric),s(v.OuterBlockQuantumTurnMetric),s(v.RangeBlockTurnMetric)):i.pg&&(s(v.RangeBlockTurnMetric),s(v.RangeBlockQuantumTurnMetric)),s(v.ExecutionTurnMetric),t.append(")")}return e.puzzleAlg.addFreshListener(r),e.puzzleID.addFreshListener(r),t}var Ei;async function Pi(){return Ei??=(async()=>{let e=await F["3x3x3"].kpuzzle(),t=[""],r=new Set,n=[];for(let i=0;i<t.length;i++){let a=t[i],s=e.defaultPattern().applyAlg(a).patternData.CENTERS.pieces.join(",");if(!r.has(s)){r.add(s),n.push(a);for(let l of["x","y","z"])t.push((a+" "+l).trim())}}return n})()}async function sr(e,t,r){let n=r==="2x2"?await F["3x3x3"].kpuzzle():e,i=n.defaultPattern(),a=n.algToTransformation(t.invert()),s=n.definition.orbits.filter(d=>d.orbitName.startsWith("CENTER")),l=s.reduce((d,u)=>d+u.numPieces*(u.numPieces===6?100:1),0),c="",o=-1;for(let d of await Pi()){let u=i.applyAlg(d).applyTransformation(a),h=s.reduce((g,M)=>g+u.patternData[M.orbitName].pieces.reduce((I,T,L)=>I+(T===i.patternData[M.orbitName].pieces[L]?M.numPieces===6?100:1:0),0),0);if(h>o&&(c=d,o=h),h===l)break}return c}async function go(e,t,r,n){let i={"2x2":"2x2x2","3x3":"3x3x3","4x4":"4x4x4","5x5":"5x5x5"}[r];if(!i)throw new Error("Lo\u1EA1i Rubik ch\u01B0a \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.");let a=new z(at(t,r)),s=await F[i].kpuzzle();s.algToTransformation(a);let l=Array.from(a.experimentalExpand()).filter(w=>w instanceof A);if(!l.length)throw new Error("Case ch\u01B0a c\xF3 b\u01B0\u1EDBc xoay.");let c=await sr(s,a,r),o=new K({puzzle:i,alg:a,experimentalSetupAlg:c,experimentalSetupAnchor:"end",visualization:"3D",background:"none",controlPanel:"none",viewerLink:"none",hintFacelets:"none",tempoScale:.75});o.style.width="100%",o.style.height="340px",o.experimentalSetFlashLevel("none"),o.setAttribute("aria-label","M\xF4 ph\u1ECFng 3D c\xE1c b\u01B0\u1EDBc xoay c\xF4ng th\u1EE9c"),e.replaceChildren(o);let d=new tt,u=new Ke(35,1,.1,100),h=new et({antialias:!0,alpha:!0});h.setPixelRatio(Math.min(devicePixelRatio,2)),h.setClearColor(0,0),h.domElement.setAttribute("role","img"),h.domElement.setAttribute("aria-label",`Rubik ${r} 3D: k\xE9o \u0111\u1EC3 \u0111\u1ED5i g\xF3c nh\xECn`);let g=!1,M=()=>{},I=()=>{g||h.render(d,u)},T;try{let w=await Promise.race([o.experimentalCurrentThreeJSPuzzleObject(I),new Promise((Ni,or)=>{T=setTimeout(()=>or(new Error("B\u1ED9 d\u1EF1ng 3D ch\u01B0a s\u1EB5n s\xE0ng. Vui l\xF2ng th\u1EED l\u1EA1i.")),12e3)})]);M=st(w),d.add(w);let Y=new Je().setFromObject(w).getSize(new Xe).length();u.position.set(Y*1.1,Y*.9,Y*1.4),u.lookAt(0,0,0)}catch(w){throw g=!0,M(),h.dispose(),o.pause(),o.remove(),w}finally{clearTimeout(T)}d.add(new rt(16777215,6713477,2.5));let L=new nt(16777215,2.5);L.position.set(4,8,5),d.add(L),o.style.cssText="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none",o.setAttribute("aria-hidden","true"),e.appendChild(h.domElement);let D=new it(u,h.domElement);D.enablePan=!1,D.minDistance=u.position.length()*.65,D.maxDistance=u.position.length()*1.8,D.addEventListener("change",I);let R=new ResizeObserver(()=>{let w=e.clientWidth,Y=e.clientHeight||340;h.setSize(w,Y),u.aspect=w/Y,u.updateProjectionMatrix(),I()});R.observe(e),I();let Q=o.experimentalModel,Fe=await Q.indexer.get(),se=0,we=!1,je=w=>{g||(se=w.atEnd?l.length:w.atStart?0:Math.min(l.length,Fe.timestampToIndex(w.timestamp+.001)),n({index:se,total:l.length,playing:we}),I())},Be=w=>{we=w.playing,g||n({index:se,total:l.length,playing:we})};return Q.detailedTimelineInfo.addFreshListener(je),Q.playingInfo.addFreshListener(Be),o.jumpToStart(),{steps:l.map(w=>w.toString()),play(){se>=l.length&&o.jumpToStart(),o.play()},pause(){o.pause()},seek(w){o.pause(),o.timestamp=Fe.indexToMoveStartTimestamp(Math.max(0,Math.min(l.length,w)))},speed(w){o.tempoScale=w},resetView(){D.reset()},dispose(){g=!0,o.pause(),Q.detailedTimelineInfo.removeFreshListener(je),Q.playingInfo.removeFreshListener(Be),R.disconnect(),D.dispose(),M(),h.dispose(),h.forceContextLoss(),o.remove(),h.domElement.remove()}}}export{go as createCubePlayer};
