document.addEventListener('DOMContentLoaded', () => {
    //////////////////////
    // 1. Video Lectures //
    //////////////////////
    const lectures = [
      { src: 'assets/lecture1.mp4', transcript: 'assets/lecture1.txt' },
      { src: 'assets/lecture2.mp4', transcript: 'assets/lecture2.txt' },
      // … add more …
    ];
    let currentLecture = 0;
  
    const videoContainer = document.getElementById('video-player');
    const nextLectureBtn = document.getElementById('next-lecture');
  
    function loadLecture(idx) {
      videoContainer.innerHTML = `
        <video id="lecture-video" controls src="${lectures[idx].src}"></video>
        <div id="video-transcript">Loading transcript…</div>
      `;
      fetch(lectures[idx].transcript)
        .then(r => r.text())
        .then(txt => document.getElementById('video-transcript').innerText = txt);
    }
    nextLectureBtn.addEventListener('click', () => {
      currentLecture = (currentLecture + 1) % lectures.length;
      loadLecture(currentLecture);
    });
    loadLecture(currentLecture);
  
    ///////////////////
    // 2. Assignments //
    ///////////////////
    const assignments = [
      {
        id: 1,
        markdown: '### Assignment 1: Implement sigmoid\nWrite a JavaScript function `sigmoid(x)` that returns `1/(1+e^-x)`.',
        validator: code => /return\s+1\/\(1\+Math\.exp\(-x\)\)/.test(code)
      },
      // … more …
    ];
    let currentAsg = 0;
  
    const asgContainer = document.getElementById('assignment-container');
    const asgTextarea = document.getElementById('assignment-solution');
    const asgSubmit = document.getElementById('submit-assignment');
    const asgFeedback = document.getElementById('assignment-feedback');
  
    function loadAssignment(idx) {
      asgContainer.innerHTML = marked(assignments[idx].markdown);
      asgTextarea.value = '';
      asgFeedback.innerText = '';
    }
    asgSubmit.addEventListener('click', () => {
      const sol = asgTextarea.value;
      const ok = assignments[currentAsg].validator(sol);
      asgFeedback.innerText = ok ? '✅ Correct!' : '❌ Try again.';
      asgFeedback.className = ok ? 'correct' : 'incorrect';
    });
    loadAssignment(currentAsg);
  
    ///////////////////////
    // 3. Interactive Quiz //
    ///////////////////////
    const quizData = [
      {
        question: 'What is the activation function for a perceptron?',
        choices: ['ReLU', 'Step function', 'Sigmoid'],
        answer: 1,
        hint: 'It outputs either 0 or 1.'
      },
      // … more …
    ];
    let currentQuiz = 0;
  
    const quizContainer = document.getElementById('quiz-container');
    const quizNextBtn = document.getElementById('quiz-next');
  
    function renderQuiz(idx) {
      const q = quizData[idx];
      quizContainer.innerHTML = `
        <div class="quiz-question">${q.question}</div>
        <ul class="quiz-choices">
          ${q.choices.map((c,i) => `<li><label><input type="radio" name="choice" value="${i}"/> ${c}</label></li>`).join('')}
        </ul>
        <button id="show-hint">Show Hint</button>
        <div class="hint">${q.hint}</div>
        <div id="quiz-feedback"></div>
      `;
      document.getElementById('show-hint').onclick = () => {
        quizContainer.querySelector('.hint').style.display = 'block';
      };
      quizContainer.querySelectorAll('input[name="choice"]').forEach(radio => {
        radio.addEventListener('change', e => {
          const picked = +e.target.value;
          const fb = document.getElementById('quiz-feedback');
          if (picked === q.answer) {
            fb.innerText = '✅ Correct!';
            fb.className = 'correct';
          } else {
            fb.innerText = '❌ Incorrect.';
            fb.className = 'incorrect';
          }
        });
      });
    }
    quizNextBtn.addEventListener('click', () => {
      currentQuiz = (currentQuiz + 1) % quizData.length;
      renderQuiz(currentQuiz);
    });
    renderQuiz(currentQuiz);
  
    ////////////////////////////
    // 4. Perceptron demo //
    ////////////////////////////
    // … your D3 + TF.js code from before …
  
  });
  
document.addEventListener('DOMContentLoaded', () => {
    const width = 600, height = 300;
    const svg = d3.select('#viz-perceptron')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    // Node positions
    const nodes = [
      {id: 'x1', x: 150, y: 100},
      {id: 'x2', x: 150, y: 200},
      {id: 'out', x: 450, y: 150}
    ];
    const links = [
      {source: 'x1', target: 'out'},
      {source: 'x2', target: 'out'}
    ];
  
    // Draw nodes
    svg.selectAll('circle.node')
      .data(nodes)
      .enter().append('circle')
        .attr('class','node')
        .attr('cx', d=>d.x).attr('cy', d=>d.y)
        .attr('r', 20)
        .attr('fill', '#ffd166');
  
    svg.selectAll('text.label')
      .data(nodes)
      .enter().append('text')
        .attr('x', d=>d.x).attr('y', d=>d.y+5)
        .attr('text-anchor','middle')
        .text(d=>d.id);
  
    // Draw links (initial weight = 1)
    const linkEls = svg.selectAll('line.link')
      .data(links)
      .enter().append('line')
        .attr('class','link')
        .attr('x1', d=>nodes.find(n=>n.id===d.source).x)
        .attr('y1', d=>nodes.find(n=>n.id===d.source).y)
        .attr('x2', d=>nodes.find(n=>n.id===d.target).x)
        .attr('y2', d=>nodes.find(n=>n.id===d.target).y)
        .attr('stroke-width', 2);
  
    // Activation function
    function perceptronOutput(w) {
      const x = tf.tensor2d([[1,1]]);
      const b = tf.tensor1d([0]);
      const weights = tf.tensor2d([[w],[w]]);
      const y = x.matMul(weights).sub(b).sign().arraySync();
      return y[0][0];
    }
  
    // Update coloring based on weight
    function update(w) {
      d3.select('#w-value').text(w.toFixed(1));
      linkEls
        .attr('stroke-width', Math.abs(w) * 2)
        .attr('stroke', w > 0 ? '#06d6a0' : '#ef476f');
      const out = perceptronOutput(w);
      svg.select('circle.node:nth-child(3)')
         .attr('fill', out > 0 ? '#06d6a0' : '#ef476f');
    }
  
    // Slider hookup
    const slider = document.getElementById('weight-slider');
    slider.addEventListener('input', e => update(+e.target.value));
  
    // initialize
    update(+slider.value);
  });
  

    //////////////////////////////
  // 3.2 Backprop Explorer   //
  //////////////////////////////

  // Network architecture
  const bpWidth = 600, bpHeight = 350;
  const svgBP = d3.select('#viz-backprop')
    .append('svg')
    .attr('width', bpWidth)
    .attr('height', bpHeight);

  // Node definitions
  const bpLayers = [
    [ {id:'x1', x:100, y:100}, {id:'x2', x:100, y:250} ],
    [ {id:'h1', x:300, y:100}, {id:'h2', x:300, y:250} ],
    [ {id:'out', x:500, y:175} ]
  ];
  // Flatten and draw nodes
  const bpNodes = bpLayers.flat();
  svgBP.selectAll('circle.bp-node')
    .data(bpNodes).enter()
    .append('circle')
      .attr('class','bp-node')
      .attr('cx', d=>d.x).attr('cy', d=>d.y)
      .attr('r', 25)
      .attr('fill','#ffd166');

  svgBP.selectAll('text.bp-label')
    .data(bpNodes).enter()
    .append('text')
      .attr('class','bp-label')
      .attr('x', d=>d.x).attr('y', d=>d.y+5)
      .attr('text-anchor','middle')
      .text(d=>d.id);

  // Draw links function
  let bpLinks;
  function drawBPLinks(weights) {
    // remove old
    svgBP.selectAll('line.bp-link').remove();
    const links = [];
    // from layer i to i+1
    for (let i=0; i<bpLayers.length-1; i++) {
      bpLayers[i].forEach(src => {
        bpLayers[i+1].forEach(tgt => {
          links.push({src, tgt, w: weights[src.id+'_'+tgt.id]});
        });
      });
    }
    bpLinks = svgBP.selectAll('line.bp-link')
      .data(links).enter()
      .append('line')
        .attr('class','bp-link')
        .attr('x1', d=>d.src.x).attr('y1', d=>d.src.y)
        .attr('x2', d=>d.tgt.x).attr('y2', d=>d.tgt.y)
        .attr('stroke-width', d=>Math.abs(d.w)*5+1)
        .attr('stroke', d=> d.w>0 ? '#06d6a0' : '#ef476f');
  }

  // Build a simple TF model programmatically
  let modelBP;
  function initModel() {
    modelBP = tf.sequential();
    modelBP.add(tf.layers.dense({units:2, inputShape:[2], activation:'sigmoid', name:'hidden'}));
    modelBP.add(tf.layers.dense({units:1, activation:'sigmoid', name:'output'}));
    modelBP.compile({optimizer: tf.train.sgd(0.1), loss: 'meanSquaredError'});
  }

  initModel();

  // Extract weights into a map { 'x1_h1':..., ... }
  function getWeightsMap() {
    const vars = modelBP.getWeights();
    // vars[0]: hidden kernel [2x2], vars[1]: hidden bias [2], vars[2]: output kernel [2x1], ...
    const wMap = {};
    const hW = vars[0].arraySync(); // shape [2][2]
    bpLayers[0].forEach((n,i) => {
      bpLayers[1].forEach((m,j) => {
        wMap[n.id+'_'+m.id] = hW[i][j];
      });
    });
    const oW = vars[2].arraySync(); // shape [2][1]
    bpLayers[1].forEach((n,i) => {
      wMap[n.id+'_'+bpLayers[2][0].id] = oW[i][0];
    });
    return wMap;
  }

  // Initial draw
  drawBPLinks(getWeightsMap());

  // Control elements
  const bpX1 = document.getElementById('bp-x1');
  const bpX2 = document.getElementById('bp-x2');
  const bpY  = document.getElementById('bp-y');
  const bpLR = document.getElementById('bp-lr');
  const bpStepBtn = document.getElementById('bp-step');
  const bpResetBtn= document.getElementById('bp-reset');

  // Single training step & re-render links
  bpStepBtn.addEventListener('click', () => {
    const xs = tf.tensor2d([[+bpX1.value, +bpX2.value]]);
    const ys = tf.tensor2d([[+bpY.value]]);
    // recompile with new LR
    modelBP.compile({optimizer: tf.train.sgd(+bpLR.value), loss: 'meanSquaredError'});
    // train for 1 batch
    modelBP.fit(xs, ys, {epochs:1}).then(() => {
      drawBPLinks(getWeightsMap());
      xs.dispose(); ys.dispose();
    });
  });

  // Reset model
  bpResetBtn.addEventListener('click', () => {
    initModel();
    drawBPLinks(getWeightsMap());
  });
