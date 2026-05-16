export const TABLE_TEMPLATES = [
  {
    category: 'tables', title: 'Pros vs Cons Evaluation', type: 'Decision', color: '#10B981', iconBg: 'bg-emerald-100', text: 'text-emerald-600',
    html: `<table>
      <tr><th>Aspect evaluated</th><th>🟢 Pros (Advantages)</th><th>🔴 Cons (Disadvantages)</th><th>Weight (1-5)</th></tr>
      <tr><td>Implementation Speed</td><td>Fast to deploy out of the box</td><td>Requires specific environment setup</td><td>4</td></tr>
      <tr><td>Scalability Index</td><td>Handles millions of requests easily</td><td>Database tuning required later</td><td>5</td></tr>
      <tr><td>Cost to Maintain</td><td>Free tier is generous</td><td>Premium instances get expensive</td><td>3</td></tr>
      <tr><td>Team familiarity</td><td>Most devs already know it</td><td>None</td><td>5</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Task Eisenhower Matrix', type: 'Productivity', color: '#8B5CF6', iconBg: 'bg-purple-100', text: 'text-purple-600',
    html: `<table>
      <tr><th>Action Item</th><th>Urgency</th><th>Importance</th><th>Quadrant Outcome</th></tr>
      <tr><td>Fix Critical Production Bug</td><td>High (Urgent)</td><td>High (Important)</td><td><strong>DO IT NOW</strong></td></tr>
      <tr><td>Plan Q3 Roadmap</td><td>Low (Not Urgent)</td><td>High (Important)</td><td><strong>SCHEDULE IT</strong></td></tr>
      <tr><td>Reply to basic inquiries</td><td>High (Urgent)</td><td>Low (Not Important)</td><td><strong>DELEGATE IT</strong></td></tr>
      <tr><td>Review old archived files</td><td>Low (Not Urgent)</td><td>Low (Not Important)</td><td><strong>DELETE IT</strong></td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'SWOT Analysis', type: 'Strategy', color: '#F59E0B', iconBg: 'bg-amber-100', text: 'text-amber-600',
    html: `<table>
      <tr><th>Factor Dimension</th><th>Category Type</th><th>Detailed Description</th><th>Impact</th></tr>
      <tr><td>Brand Reputation</td><td>💪 Strength (Internal)</td><td>Highly trusted in the local sector</td><td>High Positive</td></tr>
      <tr><td>Marketing Budget</td><td>📉 Weakness (Internal)</td><td>Limited funds compared to rivals</td><td>High Negative</td></tr>
      <tr><td>Emerging Markets</td><td>🎯 Opportunity (External)</td><td>Expanding needs in South Asia</td><td>Medium Positive</td></tr>
      <tr><td>New Competitors</td><td>⚠️ Threat (External)</td><td>Tech startups entering the niche</td><td>High Negative</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Weekly Habit Tracker', type: 'Personal', color: '#0EA5E9', iconBg: 'bg-sky-100', text: 'text-sky-600',
    html: `<table>
      <tr><th>Habit Objective</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Weekend Focus</th></tr>
      <tr><td>Deep Work (2 hrs)</td><td>✅</td><td>✅</td><td>❌</td><td>✅</td><td>✅</td><td>Reflection</td></tr>
      <tr><td>Read 10 Pages</td><td>✅</td><td>❌</td><td>✅</td><td>✅</td><td>❌</td><td>Catch up</td></tr>
      <tr><td>Morning Workout</td><td>❌</td><td>✅</td><td>✅</td><td>❌</td><td>✅</td><td>Rest recovery</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'RACI Accountability Matrix', type: 'Management', color: '#EF4444', iconBg: 'bg-red-100', text: 'text-red-600',
    html: `<table>
      <tr><th>Project Task / Deliverable</th><th>Project Manager</th><th>Lead Developer</th><th>Client / Stakeholder</th></tr>
      <tr><td>Requirements Gathering</td><td>Accountable (A)</td><td>Consulted (C)</td><td>Responsible (R)</td></tr>
      <tr><td>System Architecture Design</td><td>Informed (I)</td><td>Responsible (R) & Accountable (A)</td><td>Informed (I)</td></tr>
      <tr><td>User Acceptance Testing</td><td>Responsible (R)</td><td>Informed (I)</td><td>Accountable (A)</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Feature Comparison', type: 'Matrix', color: '#8B5CF6', iconBg: 'bg-purple-100', text: 'text-purple-600',
    html: `<table>
      <tr><th>Feature</th><th>Starter</th><th>Professional</th><th>Enterprise</th></tr>
      <tr><td>API Access</td><td>Limited</td><td>Standard</td><td>Unlimited</td></tr>
      <tr><td>Custom Domains</td><td>No</td><td>Yes</td><td>Yes + Wildcards</td></tr>
      <tr><td>Support</td><td>Email</td><td>Priority 24/7</td><td>Dedicated Manager</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Financial Q1 Report', type: 'Report', color: '#10B981', iconBg: 'bg-emerald-100', text: 'text-emerald-600',
    html: `<table>
      <tr><th>Metric</th><th>Jan</th><th>Feb</th><th>Mar</th><th>Q1 Total</th></tr>
      <tr><td>Gross Revenue</td><td>$45,000</td><td>$52,000</td><td>$68,000</td><td>$165,000</td></tr>
      <tr><td>Operating Costs</td><td>$22,000</td><td>$23,000</td><td>$25,000</td><td>$70,000</td></tr>
      <tr><td>Net Profit</td><td>$23,000</td><td>$29,000</td><td>$43,000</td><td>$95,000</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Project Timeline', type: 'Schedule', color: '#3B82F6', iconBg: 'bg-blue-100', text: 'text-blue-600',
    html: `<table>
      <tr><th>Phase</th><th>Owner</th><th>Start Date</th><th>Status</th></tr>
      <tr><td>Planning & Discovery</td><td>Sarah J.</td><td>Oct 1</td><td>Completed</td></tr>
      <tr><td>Design Wireframes</td><td>David Chen</td><td>Oct 15</td><td>In Progress</td></tr>
      <tr><td>Backend Architecture</td><td>Alex M.</td><td>Nov 1</td><td>Blocked</td></tr>
      <tr><td>Frontend Dev</td><td>Sarah J.</td><td>Nov 10</td><td>Pending</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Employee Directory', type: 'Directory', color: '#F59E0B', iconBg: 'bg-amber-100', text: 'text-amber-600',
    html: `<table>
      <tr><th>Name</th><th>Role</th><th>Department</th><th>Location</th></tr>
      <tr><td>Alice Freeman</td><td>Product Manager</td><td>Product</td><td>New York</td></tr>
      <tr><td>Bob Smith</td><td>Senior Dev</td><td>Engineering</td><td>Remote</td></tr>
      <tr><td>Carol Danvers</td><td>VP Marketing</td><td>Marketing</td><td>London</td></tr>
      <tr><td>Dave Clark</td><td>UX Designer</td><td>Design</td><td>Berlin</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Product Inventory', type: 'Inventory', color: '#06B6D4', iconBg: 'bg-cyan-100', text: 'text-cyan-600',
    html: `<table>
      <tr><th>SKU</th><th>Product Name</th><th>Stock Level</th><th>Reorder Point</th></tr>
      <tr><td>A-100</td><td>Wireless Ergo Mouse</td><td>145 units</td><td>50 units</td></tr>
      <tr><td>A-102</td><td>Mech Keyboard Pro</td><td>12 units</td><td>20 units</td></tr>
      <tr><td>B-555</td><td>USB-C Hub</td><td>89 units</td><td>40 units</td></tr>
      <tr><td>C-999</td><td>Monitor Stand</td><td>213 units</td><td>100 units</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Marketing Content', type: 'Schedule', color: '#EC4899', iconBg: 'bg-pink-100', text: 'text-pink-600',
    html: `<table>
      <tr><th>Post Title</th><th>Platform</th><th>Publish Date</th><th>Author</th></tr>
      <tr><td>Q3 Update Blog</td><td>Website</td><td>Sep 15</td><td>Marketing Team</td></tr>
      <tr><td>New Feature Reel</td><td>Instagram</td><td>Sep 18</td><td>Social Lead</td></tr>
      <tr><td>Tech Deep Dive</td><td>LinkedIn</td><td>Sep 20</td><td>Engineering</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Pricing Tiers', type: 'Pricing', color: '#14B8A6', iconBg: 'bg-teal-100', text: 'text-teal-600',
    html: `<table>
      <tr><th>Plan</th><th>Seat Price</th><th>Storage</th><th>Compute Limit</th></tr>
      <tr><td>Hobby</td><td>Free</td><td>5 GB</td><td>100 hrs</td></tr>
      <tr><td>Team</td><td>$12/mo</td><td>100 GB</td><td>2500 hrs</td></tr>
      <tr><td>Business</td><td>$49/mo</td><td>1 TB</td><td>Unlimited</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Invoice Summary', type: 'Billing', color: '#6366F1', iconBg: 'bg-indigo-100', text: 'text-indigo-600',
    html: `<table>
      <tr><th>Item Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
      <tr><td>Consulting Hours</td><td>15</td><td>$150.00</td><td>$2,250.00</td></tr>
      <tr><td>Software Licensing</td><td>1</td><td>$499.00</td><td>$499.00</td></tr>
      <tr><td>Server Hosting</td><td>3</td><td>$50.00</td><td>$150.00</td></tr>
      <tr><th>Grand Total</th><th></th><th></th><th>$2,899.00</th></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Server Architecture', type: 'Infrastructure', color: '#84CC16', iconBg: 'bg-lime-100', text: 'text-lime-600',
    html: `<table>
      <tr><th>Service Name</th><th>Instance Type</th><th>Region</th><th>Primary Function</th></tr>
      <tr><td>API Gateway</td><td>t3.medium</td><td>us-east-1</td><td>Routing & Auth</td></tr>
      <tr><td>Database Primary</td><td>db.r6g.large</td><td>us-east-1</td><td>Core App Data</td></tr>
      <tr><td>Redis Cache</td><td>cache.t3.micro</td><td>us-east-1</td><td>Session State</td></tr>
      <tr><td>Worker Node</td><td>t3.large</td><td>us-east-2</td><td>Background Jobs</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Compliance Checklist', type: 'Audit', color: '#EF4444', iconBg: 'bg-red-100', text: 'text-red-600',
    html: `<table>
      <tr><th>Requirement</th><th>Standard</th><th>Owner</th><th>Status</th></tr>
      <tr><td>Data Encryption at Rest</td><td>SOC2 CC6.1</td><td>DevOps</td><td>Compliant</td></tr>
      <tr><td>Annual Pen Test</td><td>ISO 27001</td><td>Security</td><td>Scheduled</td></tr>
      <tr><td>Employee Security Training</td><td>HIPAA</td><td>HR</td><td>75% Complete</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'Customer Feedback', type: 'Log', color: '#EAB308', iconBg: 'bg-yellow-100', text: 'text-yellow-600',
    html: `<table>
      <tr><th>Ticket ID</th><th>Priority</th><th>User Sentiment</th><th>Tags</th></tr>
      <tr><td>#9012</td><td>High</td><td>Frustrated</td><td>Bug, UI</td></tr>
      <tr><td>#9013</td><td>Low</td><td>Positive</td><td>Feature Request</td></tr>
      <tr><td>#9014</td><td>Urgent</td><td>Neutral</td><td>Billing, Access</td></tr>
    </table>`
  },
  {
    category: 'tables', title: 'SEO Keyword Matrix', type: 'Marketing', color: '#0EA5E9', iconBg: 'bg-sky-100', text: 'text-sky-600',
    html: `<table>
      <tr><th>Keyword / Phrase</th><th>Search Vol</th><th>Difficulty</th><th>Current Rank</th></tr>
      <tr><td>AI Data Analytics</td><td>12,500</td><td>High (78)</td><td>#4</td></tr>
      <tr><td>Best charting tool</td><td>5,200</td><td>Medium (45)</td><td>#12</td></tr>
      <tr><td>Free dashboard maker</td><td>22,100</td><td>Very High (89)</td><td>#24</td></tr>
    </table>`
  }
];
