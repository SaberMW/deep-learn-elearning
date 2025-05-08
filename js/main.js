// js/main.js

document.addEventListener('DOMContentLoaded', () => {

  window.addEventListener('load', () => {
    // Scroll to the absolute top-left of the page
    window.scrollTo(0, 0);
    // Remove the hash from the URL so future reloads don't jump
    history.replaceState(null, null, window.location.pathname + window.location.search);
  });


  
  // ─── Perceptron Explorer ───
  const width = 600, height = 300;
  const svg = d3.select('#viz-perceptron')
    .append('svg').attr('width', width).attr('height', height);

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
    .data(nodes).enter()
    .append('circle')
      .attr('class', d => d.id === 'out' ? 'node node-out' : 'node')
      .attr('cx', d => d.x).attr('cy', d => d.y)
      .attr('r', 20).attr('fill', '#ffd166');

  svg.selectAll('text.label')
    .data(nodes).enter()
    .append('text')
      .attr('x', d => d.x).attr('y', d => d.y + 5)
      .attr('text-anchor', 'middle')
      .text(d => d.id);

  const linkEls = svg.selectAll('line.link')
    .data(links).enter()
    .append('line')
      .attr('class', 'link')
      .attr('x1', d => nodes.find(n => n.id === d.source).x)
      .attr('y1', d => nodes.find(n => n.id === d.source).y)
      .attr('x2', d => nodes.find(n => n.id === d.target).x)
      .attr('y2', d => nodes.find(n => n.id === d.target).y)
      .attr('stroke-width', 2);

  function perceptronOutput(w) {
    const x = tf.tensor2d([[1,1]]);
    const b = tf.tensor1d([0]);
    const weights = tf.tensor2d([[w],[w]]);
    const y = x.matMul(weights).sub(b).sign().arraySync()[0][0];
    x.dispose(); b.dispose(); weights.dispose();
    return y;
  }

  function updatePerceptron(w) {
    d3.select('#w-value').text(w.toFixed(1));
    linkEls
      .attr('stroke-width', Math.abs(w) * 2)
      .attr('stroke', w > 0 ? '#06d6a0' : '#ef476f');
    const out = perceptronOutput(w);
    svg.select('circle.node-out')
       .attr('fill', out > 0 ? '#06d6a0' : '#ef476f');
  }

  const weightSlider = document.getElementById('weight-slider');
  weightSlider.addEventListener('input', e => updatePerceptron(+e.target.value));
  updatePerceptron(+weightSlider.value);


  // ─── Backpropagation Explorer ───
  const bpWidth = 600, bpHeight = 350;
  const svgBP = d3.select('#viz-backprop')
    .append('svg').attr('width', bpWidth).attr('height', bpHeight);

  const bpLayers = [
    [ {id:'x1', x:100, y:100}, {id:'x2', x:100, y:250} ],
    [ {id:'h1', x:300, y:100}, {id:'h2', x:300, y:250} ],
    [ {id:'out', x:500, y:175} ]
  ];

  const bpNodes = bpLayers.flat();
  svgBP.selectAll('circle.bp-node')
    .data(bpNodes).enter()
    .append('circle')
      .attr('class','bp-node')
      .attr('cx', d=>d.x).attr('cy', d=>d.y)
      .attr('r', 25).attr('fill','#ffd166');

  svgBP.selectAll('text.bp-label')
    .data(bpNodes).enter()
    .append('text')
      .attr('class','bp-label')
      .attr('x', d=>d.x).attr('y', d=>d.y+5)
      .attr('text-anchor','middle')
      .text(d=>d.id);

  let modelBP;
  function initModel() {
    modelBP = tf.sequential();
    modelBP.add(tf.layers.dense({units:2, inputShape:[2], activation:'sigmoid'}));
    modelBP.add(tf.layers.dense({units:1, activation:'sigmoid'}));
    modelBP.compile({optimizer: tf.train.sgd(0.1), loss: 'meanSquaredError'});
  }

  initModel();

  function getWeightsMap() {
    const vars = modelBP.getWeights();
    const wMap = {};
    const hW = vars[0].arraySync();  // [2][2]
    bpLayers[0].forEach((n,i)=> {
      bpLayers[1].forEach((m,j)=> {
        wMap[n.id+'_'+m.id] = hW[i][j];
      });
    });
    const oW = vars[2].arraySync();  // [2][1]
    bpLayers[1].forEach((n,i)=> {
      wMap[n.id+'_'+bpLayers[2][0].id] = oW[i][0];
    });
    return wMap;
  }

  function drawBPLinks(weights) {
    svgBP.selectAll('line.bp-link').remove();
    const links = [];
    for(let i=0;i<bpLayers.length-1;i++){
      bpLayers[i].forEach(src=>{
        bpLayers[i+1].forEach(tgt=>{
          links.push({src, tgt, w: weights[src.id+'_'+tgt.id]});
        });
      });
    }
    svgBP.selectAll('line.bp-link')
      .data(links).enter()
      .append('line')
        .attr('class','bp-link')
        .attr('x1', d=>d.src.x).attr('y1', d=>d.src.y)
        .attr('x2', d=>d.tgt.x).attr('y2', d=>d.tgt.y)
        .attr('stroke-width', d=>Math.abs(d.w)*5+1)
        .attr('stroke', d=> d.w>0 ? '#06d6a0' : '#ef476f');
  }

  drawBPLinks(getWeightsMap());

  const bpX1      = document.getElementById('bp-x1');
  const bpX2      = document.getElementById('bp-x2');
  const bpY       = document.getElementById('bp-y');
  const bpLR      = document.getElementById('bp-lr');
  const bpStepBtn = document.getElementById('bp-step');
  const bpResetBtn= document.getElementById('bp-reset');

  bpStepBtn.addEventListener('click', () => {
    const xs = tf.tensor2d([[+bpX1.value, +bpX2.value]]);
    const ys = tf.tensor2d([[+bpY.value]]);
    modelBP.compile({optimizer: tf.train.sgd(+bpLR.value), loss: 'meanSquaredError'});
    modelBP.fit(xs, ys, {epochs:1}).then(()=>{
      drawBPLinks(getWeightsMap());
      xs.dispose(); ys.dispose();
    });
  });

  bpResetBtn.addEventListener('click', () => {
    initModel();
    drawBPLinks(getWeightsMap());
  });


  // ─── Quiz Engine ───
  const quizData = [
    { question: "1. What makes deep learning different from traditional machine learning?",
      choices: [
        "Uses decision trees instead of linear models",
        "Automatically learns hierarchical features through stacked layers",
        "Only works on small datasets",
        "Doesn’t require any training data"
      ],
      answer: 1,
      hint: "Think about how features are obtained in deep nets vs. hand-crafted."
    },
    { question: "2. Which equation defines a perceptron’s weighted sum + bias?",
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
      question: `3. Which gate decides what new information to add to the cell state?<br/>
      <img
          src="assets/images/RNNs & LSTMs from Data Science Duniya.png"
          alt="RNNs & LSTMs diagram"
          width="750"
          class="quiz-diagram"
          />
          `,

      choices: [
        "Forget Gate",
        "Output Gate",
        "Input Gate",
        "Reset Gate"
      ],
      answer: 2,
      hint: "It controls how much of the new candidate state gets stored."
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
      question: `
        12. In the animation below, a 3×3 filter (blue) slides over the input and builds a feature map.  
        Which operation is occurring at each step?<br/>
        <img
          src="assets/images/CNNs from Medium.com.gif"
          alt="CNN sliding-window animation"
          width="750"
          class="quiz-diagram"
        />
      `,
      choices: [
        "Max-pooling over the patch",
        "Element-wise multiplication and sum",
        "Summing all inputs in the patch without weights",
        "Applying a ReLU without weights"
      ],
      answer: 1,
      hint: "Convolution is a weighted sum (dot-product)."
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
    // … include all 20 questions here exactly as discussed …
  ];

  let currentQuiz = 0;
  const quizContainer = document.getElementById('quiz-container');
  const quizNextBtn  = document.getElementById('quiz-next');

  function renderQuiz(idx) {
    const q = quizData[idx];
    quizContainer.innerHTML = `
      <div class="quiz-question">${q.question}</div>
      <ul class="quiz-choices">
        ${q.choices.map((c,i)=>
          `<li><label>
             <input type="radio" name="choice" value="${i}" />
             ${c}
           </label></li>`
        ).join('')}
      </ul>
      <button id="show-hint" aria-label="Show hint for this quiz question">
           Show Hint
          </button>
      <div class="hint" style="display:none;">${q.hint}</div>
      <div id="quiz-feedback"></div>
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

  // Render first question:
  renderQuiz(currentQuiz);
});


// ─── Coding Exercises ───
require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.33.0/min/vs' }});
require(['vs/editor/editor.main'], () => 
  {
  const editor = monaco.editor.create(document.getElementById('code-editor'), {
      value: `// Implement the sigmoid function
function sigmoid(x) {
    // TYPE YOUR CODE HERE
}

// Test cases
console.log(sigmoid(0)); // expected 0.5
console.log(sigmoid(2)); // expected ~0.88
`,
      language: 'javascript',
      theme: 'vs-light',
      automaticLayout: true,
    });

// Run button handler
document.getElementById('run-code').addEventListener('click', () => {
  const code = editor.getValue();
  const outputEl = document.getElementById('code-output');
  outputEl.textContent = '';  // clear previous

  try {
    // Capture console.log
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    // Execute the user’s code
    new Function(code)();

    // Restore console.log
    console.log = originalLog;

    // Show results
    outputEl.textContent = logs.length ? logs.join('\n') : 'No output';
  } catch (err) {
    console.log = originalLog;  // ensure we restore on error
    outputEl.textContent = 'Error: ' + err.message;
  }
});

  // … inside require(['vs/editor/editor.main'], () => { … })
const solutionCode = `// Implement the sigmoid function
function sigmoid(x) {
    // 1. Compute e⁻ˣ: this term shrinks toward 0 as x grows, and grows large as x is negative.
    const expNegX = Math.exp(-x);
    // 2. Build the denominator: 1 + e⁻ˣ shifts the midpoint to x=0.
    const denom = 1 + expNegX;
    // 3. Return the sigmoid value: 1 / denom maps x to (0, 1).
    //    • x = 0 → 1/(1+1) = 0.5  
    //    • x → +∞ → 1  
    //    • x → -∞ → 0
    return 1 / denom;
}

// Test cases
console.log(sigmoid(0));   // expected 0.5
console.log(sigmoid(2));   // expected ~0.88
`;

document.getElementById('show-answer').addEventListener('click', () => {
// Populate the editor with the correct solution
editor.setValue(solutionCode);
// Clear any previous output
document.getElementById('code-output').textContent = '';
  });
  

    // ─── Progress Tracking Dashboard ───
const progressSections = [
  'your-progress',
  'introduction',
  'perceptron',
  'activation-functions',
  'multilayer-perceptrons',
  'backpropagation-and-gradient-descent',
  'training-mechanics',
  'cnns',
  'rnns-and-lstms',
  'attention-and-transformers',
  'quiz',
  'coding-exercises'
];

function updateBar() {
  const total = progressSections.length;
  const done  = progressSections.filter(id => {
    const cb = progressList.querySelector(`input[data-section="${id}"]`);
    return cb && cb.checked;
  }).length;
  const pct = Math.round((done / total) * 100);
  progressBar.style.width = pct + '%';
}

function saveProgress() {
  const result = {};
  progressSections.forEach(id => {
    const cb = progressList.querySelector(`input[data-section="${id}"]`);
    result[id] = cb.checked;
  });
  localStorage.setItem('dlProgress', JSON.stringify(result));
  updateBar();
}

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem('dlProgress') || '{}');
  progressSections.forEach(id => {
    const cb = progressList.querySelector(`input[data-section="${id}"]`);
    if (cb) cb.checked = !!saved[id];
  });
  updateBar();
}

//Many features-----adjust later

const tocLinks = document.querySelectorAll('#toc a');
const sections = Array.from(tocLinks).map(a =>
  document.querySelector(a.getAttribute('href'))
);

// 0) Inject a tiny sentinel after each <section>
sections.forEach(sec => {
  const sentinel = document.createElement('div');
  sentinel.className           = 'section-sentinel';
  sentinel.dataset.section     = sec.id;      // so we know which one it belongs to
  sentinel.style.height        = '1px';       // small but measurable
  sentinel.style.marginTop     = '0px';
  sentinel.style.padding       = '0px';
  sec.after(sentinel);
});


// 0) Scroll‐direction tracking (place near top of your DOMContentLoaded)
let prevScrollY    = window.scrollY;
let scrollingDown  = false;
window.addEventListener('scroll', () => {
  const currY = window.scrollY;
  scrollingDown = currY > prevScrollY;
  prevScrollY   = currY;
});

// 1) Sentinel‐based completion observer
const completed    = new Set();
const progressList = document.getElementById('progress-list');
const progressBar  = document.getElementById('progress-bar');

const sentinelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // only fire when its sentinel enters view AND we are scrolling down
    if (entry.isIntersecting && scrollingDown) {
      const sectionId = entry.target.dataset.section;
      if (!completed.has(sectionId)) {
        completed.add(sectionId);

        // a) Mark the TOC link
        const link = document.querySelector(`#toc a[href="#${sectionId}"]`);
        link && link.classList.add('completed');

        // b) Check its checkbox in the progress list
        const cb = progressList.querySelector(`input[data-section="${sectionId}"]`);
        if (cb) cb.checked = true;

        // c) Update your visual progress bar
        updateBar();

        // d) Stop observing this sentinel
        sentinelObserver.unobserve(entry.target);
      }
    }
  });
}, {
  root: null,
  rootMargin: '0px',
  threshold: 0
});

// 2) Start observing all sentinels (you should have already injected .section-sentinel after each <section>)
document.querySelectorAll('.section-sentinel')
  .forEach(s => sentinelObserver.observe(s));




  // ─── Back to Top Button ───
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

// 4) Reading progress bar
  const progBar = document.getElementById('reading-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const pct = Math.min(100, (scrollTop / docHeight) * 100);
    progBar.style.width = pct + '%';
  });

  // 5) Fade-in sections
const fadeInObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeInObs.unobserve(e.target);
    }
  });
}, {
  threshold: 0,                // → trigger when even 1px is visible
  rootMargin: '0px 0px -20px 0px'  // optional: start the fade-in 20px before section bottom
});


  // observe + immediately reveal any in-view on load
document.querySelectorAll('main section').forEach(s => {
  fadeInObs.observe(s);

  // if already visible in the viewport (e.g. jumped there via anchor), show it right away
  const rect = s.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    s.classList.add('visible');
    fadeInObs.unobserve(s);
  }
});

  
});



 