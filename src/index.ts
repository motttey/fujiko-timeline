import './style.css';

const timelineData = [
  { id: 1, date: '2025-01-01', text: 'Event 1', tweetId: '1609876543210987654' },
  { id: 2, date: '2025-02-15', text: 'Event 2', tweetId: '1612345678901234567' },
  { id: 3, date: '2025-03-20', text: 'Event 3', tweetId: '1623456789012345678' },
];

const timeline = document.createElement('div');
timeline.classList.add('timeline');

timelineData.forEach(item => {
  const node = document.createElement('div');
  node.classList.add('timeline-node');
  node.textContent = item.text;
  node.addEventListener('mouseover', () => showTweet(item.tweetId));
  timeline.appendChild(node);
});

const tweetContainer = document.createElement('div');
tweetContainer.classList.add('tweet-container');

function showTweet(tweetId: string) {
  tweetContainer.innerHTML = `
    <blockquote class="twitter-tweet">
      <a href="https://twitter.com/twitterdev/status/${tweetId}"></a>
    </blockquote>
    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
  `;
}

document.body.appendChild(timeline);
document.body.appendChild(tweetContainer);
