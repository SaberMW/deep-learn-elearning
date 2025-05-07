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
    const quizData = [ {
        question: "1. What makes deep learning different from traditional machine learning?",
        choices: [
          "It uses decision trees instead of linear models",
          "It automatically learns hierarchical features through stacked layers",
          "It only works on small datasets",
          "It doesn’t require any training data"
        ],
        answer: 1,
        hint: "Think about how features are obtained in deep nets vs. hand-crafted."
      },
      {
        question: "2. Which of these is the equation for a single perceptron’s weighted sum plus bias?",
        choices: [
          "z = w₁ + x₁ + b",
          "z = w₁·x₁ + w₂·x₂ + … + wₙ·xₙ + b",
          "z = x₁ + x₂ + … + xₙ",
          "z = activation(x)"
        ],
        answer: 1,
        hint: "Each input is multiplied by its own weight."
      },
      {
        question: "3. Why do we need non-linear activation functions in neural networks?",
        choices: [
          "To speed up training",
          "To allow the network to learn complex, non-linear relationships",
          "To reduce the number of parameters",
          "To make the network fully connected"
        ],
        answer: 1,
        hint: "Linear layers stacked would collapse to a single linear transform."
      },
      {
        question: "4. Which activation is defined as max(0, x) and is fast & sparse?",
        choices: ["Sigmoid", "Tanh", "ReLU", "Softmax"],
        answer: 2,
        hint: "It zeros out all negative inputs."
      },
      {
        question: "5. The Softmax activation is most often used in the ____ layer for ____ tasks.",
        choices: [
          "hidden; regression",
          "output; multi-class classification",
          "input; data preprocessing",
          "any; reducing overfitting"
        ],
        answer: 1,
        hint: "It produces a probability distribution over classes."
      },
      {
        question: "6. In an MLP, the forward pass can be described as “each layer transforms and ____ its activations.”",
        choices: ["forgets", "passes on", "ignores", "multiplies"],
        answer: 1,
        hint: "Think of how data flows from input to output."
      },
      {
        question: "7. Which loss function is best for regression problems?",
        choices: ["Cross-entropy", "Mean Squared Error", "Softmax", "ReLU"],
        answer: 1,
        hint: "It penalizes squared differences."
      },
      {
        question: "8. Gradient descent works by:",
        choices: [
          "Climbing uphill on the loss surface",
          "Taking random steps on the loss surface",
          "Following the negative gradient to reduce loss",
          "Reversing the direction of the gradient"
        ],
        answer: 2,
        hint: "‘Downhill’ means reducing error."
      },
      {
        question: "9. Backpropagation uses the ____ to compute how each weight affects the final error.",
        choices: ["fourth derivative", "chain rule", "random sampling", "mean rule"],
        answer: 1,
        hint: "It’s a fundamental rule of calculus."
      },
      {
        question: "10. What happens if your learning rate is too large?",
        choices: [
          "Training converges more quickly",
          "Gradients vanish",
          "Updates overshoot and can diverge",
          "The model underfits"
        ],
        answer: 2,
        hint: "Think: too big steps on a hilly loss surface."
      },
      {
        question: "11. Which training method computes an update after every single example, leading to a noisy loss curve?",
        choices: [
          "Batch Gradient Descent",
          "Mini-Batch Gradient Descent",
          "Stochastic Gradient Descent",
          "Adam"
        ],
        answer: 2,
        hint: "One-sample updates = high variance."
      },
      {
        question: "12. In underfitting vs. overfitting, which curve shows low training loss but rising validation loss?", 
        // requires an image: assets/images/overfit.png
        question: `<img src="assets/images/overfit.png" alt="Overfitting loss curves"/>Which scenario is depicted above?`,
        choices: ["Underfitting", "Overfitting", "Perfect fit", "No model"],
        answer: 1,
        hint: "Training and validation diverge after some epochs."
      },
      {
        question: "13. In a convolutional layer, a 3×3 filter that slides across an image is called a ____.",
        choices: ["pool", "kernel", "bias", "neuron"],
        answer: 1,
        hint: "Also known as a feature detector."
      },
      {
        question: "14. Why do CNNs share the same filter weights across the image?",
        choices: [
          "To reduce memory usage and detect patterns everywhere",
          "To increase the number of parameters",
          "To make the model fully connected",
          "To avoid using activations"
        ],
        answer: 0,
        hint: "Weight sharing enforces translation invariance."
      },
      {
        question: "15. Pooling layers help build ____ invariance by downsampling feature maps.",
        choices: ["scale", "translation", "color", "rotation"],
        answer: 1,
        hint: "Small shifts in the input don’t change the pooled result."
      },
      {
        question: "16. RNNs maintain a hidden state so they can handle ____ data.",
        choices: ["spatial", "temporal", "graph", "tabular"],
        answer: 1,
        hint: "Sequences like text or audio."
      },
      {
        question: "17. The vanishing gradient problem makes training long sequences difficult because gradients:",
        choices: [
          "Grow exponentially",
          "Stay constant",
          "Shrink exponentially",
          "Oscillate randomly"
        ],
        answer: 2,
        hint: "They become too small to update early layers."
      },
      {
        question: "18. LSTM cells mitigate vanishing gradients by using trainable ____ that control information flow.",
        choices: ["optimizers", "dropout", "gates", "kernels"],
        answer: 2,
        hint: "Think input, forget, output."
      },
      {
        question: "19. In self-attention, each token computes scores against all tokens to capture ____ context.",
        choices: ["only previous", "global", "local", "no"],
        answer: 1,
        hint: "Every element attends to every other."
      },
      {
        question: "20. Positional encodings are added so transformers can understand ____:",
        choices: ["token importance", "token order", "token color", "token size"],
        answer: 1,
        hint: "Since self-attention is order-agnostic."
      }
    ];
  let currentQuiz = 0;
  const quizContainer = document.getElementById('quiz-container');
  const quizNextBtn  = document.getElementById('quiz-next');

  function renderQuiz(idx) {
    const q = quizData[idx];
    quizContainer.innerHTML = `
      <div class="quiz-question">${q.question}</div>
      <ul class="quiz-choices">
        ${q.choices.map((c,i) =>
          `<li><label><input type="radio" name="choice" value="${i}" aria-label="Choice ${i+1}"/> ${c}</label></li>`
        ).join('')}
      </ul>
      <button id="show-hint" aria-label="Show hint">Show Hint</button>
      <div class="hint" aria-live="polite">${q.hint}</div>
      <div id="quiz-feedback" aria-live="assertive"></div>
    `;
    document.getElementById('show-hint').onclick = () => {
      quizContainer.querySelector('.hint').style.display = 'block';
    };
    quizContainer.querySelectorAll('input[name="choice"]')
      .forEach(radio => radio.addEventListener('change', e => {
        const picked = +e.target.value;
        const fb = document.getElementById('quiz-feedback');
        if (picked === q.answer) {
          fb.textContent = '✅ Correct!';
          fb.className = 'correct';
        } else {
          fb.textContent = '❌ Try again.';
          fb.className = 'incorrect';
        }
      }));
  }

  quizNextBtn.addEventListener('click', () => {
    currentQuiz = (currentQuiz + 1) % quizData.length;
    renderQuiz(currentQuiz);
  });

  renderQuiz(currentQuiz);
});
  
    ////////////////////////////
    // 4. Perceptron demo //
    ////////////////////////////
    // … your D3 + TF.js code from before …

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
      .attr('class', (d) => d.id === 'out' ? 'node node-out' : 'node')
      .attr('cx', d => d.x).attr('cy', d => d.y)
      .attr('r', 20).attr('fill', '#ffd166');
  
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
      const y       = x.matMul(weights).sub(b).sign().arraySync()[0][0];
    x.dispose(); b.dispose(); weights.dispose();
    return y;
    }
  
    // Update coloring based on weight
    function update(w) {
      d3.select('#w-value').text(w.toFixed(1));
      linkEls
        .attr('stroke-width', Math.abs(w) * 2)
        .attr('stroke', w > 0 ? '#06d6a0' : '#ef476f');
      const out = perceptronOutput(w);
      svg.select('circle.node-out')
         .attr('fill', out > 0 ? '#06d6a0' : '#ef476f');
    }
  
    // Slider hookup
    document.getElementById('weight-slider')
    .addEventListener('input', e => updatePerceptron(+e.target.value));
  updatePerceptron(+document.getElementById('weight-slider').value);
  
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
