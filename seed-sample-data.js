#!/usr/bin/env node

/**
 * Data Seeding & Assignment Script for ResolveNow Platform
 * Ensures:
 * 1. Each Customer (john: 1, alex_customer: 2, emily_user: 3) has distinct complaints.
 * 2. Each Staff department (TECHNICAL, BILLING, GENERAL_SUPPORT, ESCALATION) has complaints assigned to it.
 */

const TARGET_URL = process.env.BACKEND_URL || 'https://resolvenow-service-desk.onrender.com';

const SAMPLE_USERS = [
  // Customers
  { username: 'john', password: 'pass123', email: 'john@example.com', role: 'USER', id: 1 },
  { username: 'alex_customer', password: 'customer123', email: 'alex.customer@techcorp.io', role: 'USER', id: 2 },
  { username: 'emily_user', password: 'emily123', email: 'emily.turner@globex.org', role: 'USER', id: 3 },

  // Staff by Department
  { username: 'sarah_staff', password: 'staff123', email: 'sarah.tech@resolvenow.io', role: 'STAFF', department: 'TECHNICAL' },
  { username: 'mike_billing', password: 'billing123', email: 'mike.billing@resolvenow.io', role: 'STAFF', department: 'BILLING' },
  { username: 'david_support', password: 'support123', email: 'david.support@resolvenow.io', role: 'STAFF', department: 'GENERAL_SUPPORT' },
  { username: 'lisa_escalation', password: 'escalate123', email: 'lisa.lead@resolvenow.io', role: 'STAFF', department: 'ESCALATION' },

  // Administrator
  { username: 'admin', password: 'admin123', email: 'admin@resolvenow.io', role: 'ADMIN' }
];

// Specific complaints per customer and department
const COMPLAINT_ASSIGNMENTS = [
  // John's Complaints (userId: 1)
  {
    title: 'Unable to reset two-factor authenticator after mobile migration',
    description: 'Employee lost access to Google Authenticator device. Backup codes are not prompting on the security verification screen.',
    category: 'GENERAL',
    priority: 'MEDIUM',
    department: 'GENERAL_SUPPORT',
    userId: 1,
    status: 'RESOLVED'
  },
  {
    title: 'Double charge on annual Enterprise subscription renewal',
    description: 'Invoice #INV-9281 was billed twice to our corporate AMEX ($2,400 x 2). Account shows renewal pending and finance team requires immediate reversal.',
    category: 'BILLING',
    priority: 'HIGH',
    department: 'BILLING',
    userId: 1,
    status: 'IN_PROGRESS'
  },
  {
    title: 'Portal Issue - Slow response when loading dashboard',
    description: 'The analytics dashboard takes 15+ seconds to render metrics after logging in.',
    category: 'GENERAL',
    priority: 'LOW',
    department: 'GENERAL_SUPPORT',
    userId: 1,
    status: 'RESOLVED'
  },

  // Alex's Complaints (userId: 2)
  {
    title: 'Enterprise SSO federation certificate renewal',
    description: 'Our Okta SSO certificate expires in 7 days, please renew the SAML metadata in production.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    department: 'TECHNICAL',
    userId: 2,
    status: 'IN_PROGRESS'
  },
  {
    title: 'Production Webhook delivery failure (HTTP 502 Bad Gateway)',
    description: 'Webhook events for order completion have failed for the past 45 minutes across all customer endpoints. Retries are getting dropped by proxy.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    department: 'TECHNICAL',
    userId: 2,
    status: 'OPEN'
  },
  {
    title: 'Request for revised EU VAT invoice with reverse-charge compliance',
    description: 'Please update invoice #INV-8812 with our newly verified VAT ID (DE382910482) and re-issue the PDF credit note.',
    category: 'BILLING',
    priority: 'LOW',
    department: 'BILLING',
    userId: 2,
    status: 'RESOLVED'
  },

  // Emily's Complaints (userId: 3)
  {
    title: 'Checkout modal unresponsive on Safari iOS',
    description: 'Customers report that clicking the Pay Now button on mobile Safari does not trigger the payment sheet.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    department: 'TECHNICAL',
    userId: 3,
    status: 'OPEN'
  },
  {
    title: 'High latency and DB connection timeouts during peak traffic',
    description: 'API Gateway response times degraded from 45ms to 1800ms. HikariCP connection pool reporting exhaustion under concurrent load.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    department: 'TECHNICAL',
    userId: 3,
    status: 'IN_PROGRESS'
  },
  {
    title: 'Corporate credit card expired - update billing primary contact',
    description: 'Need to transfer primary billing admin to accounting@resolvenow.io before the monthly cycle recharges.',
    category: 'BILLING',
    priority: 'MEDIUM',
    department: 'BILLING',
    userId: 3,
    status: 'OPEN'
  },
  {
    title: 'API documentation missing response schema for batch ticket creation',
    description: 'Developer portal OpenAPI spec does not specify whether bulk complaints accept arrays or JSON-lines format.',
    category: 'GENERAL',
    priority: 'LOW',
    department: 'GENERAL_SUPPORT',
    userId: 3,
    status: 'CLOSED'
  }
];

async function postJson(url, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ok: res.ok, data: json || text };
}

async function putRequest(url, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ok: res.ok, data: json || text };
}

async function loginUser(username, password) {
  const res = await postJson(`${TARGET_URL}/auth/login`, { username, password });
  return res.ok && res.data?.token ? res.data.token : null;
}

async function run() {
  console.log('====================================================');
  console.log('Seeding Multi-Customer & Multi-Department Data');
  console.log('====================================================\n');

  // 1. Ensure all users exist
  console.log('--- Registering Users ---');
  for (const u of SAMPLE_USERS) {
    const reg = await postJson(`${TARGET_URL}/auth/register`, {
      username: u.username,
      password: u.password,
      email: u.email,
      role: u.role
    });
    if (reg.ok || reg.status === 201) {
      console.log(`✓ Created user: ${u.username} (${u.role})`);
    } else {
      console.log(`• User ready: ${u.username}`);
    }
  }

  // 2. Login as admin to get token for assignments
  const adminToken = await loginUser('admin', 'admin123');
  const johnToken = await loginUser('john', 'pass123');
  const alexToken = await loginUser('alex_customer', 'customer123');
  const emilyToken = await loginUser('emily_user', 'emily123');

  const tokens = { 1: johnToken, 2: alexToken, 3: emilyToken };

  console.log('\n--- Lodging Complaints & Creating Department Assignments ---');
  for (const item of COMPLAINT_ASSIGNMENTS) {
    const token = tokens[item.userId] || adminToken;
    try {
      // Create Complaint
      const res = await postJson(`${TARGET_URL}/complaints`, {
        title: item.title,
        description: item.description,
        priority: item.priority,
        userId: item.userId
      }, token);

      if (res.ok || res.status === 201) {
        const ticketId = res.data.id;
        console.log(`✓ [User #${item.userId}] Created Complaint #${ticketId}: "${item.title.substring(0, 35)}..."`);

        // Explicitly create Department Assignment in assignment-service
        const assignRes = await postJson(`${TARGET_URL}/assignments`, {
          complaintId: ticketId,
          department: item.department
        }, adminToken);

        if (assignRes.ok || assignRes.status === 201) {
          console.log(`   ↳ Assigned to Department: [${item.department}] -> Agent: [${assignRes.data?.assignedTo || 'Agent'}]`);
        }

        // Update status if needed
        if (item.status && item.status !== 'OPEN') {
          await putRequest(`${TARGET_URL}/complaints/${ticketId}/status?status=${item.status}`, token);
          console.log(`   ↳ Updated status to: ${item.status}`);
        }
      } else {
        console.log(`! Failed to create complaint: HTTP ${res.status}`);
      }
    } catch (e) {
      console.error('Error on item:', e.message);
    }
  }

  console.log('\n====================================================');
  console.log('✓ Seeding Completed Successfully!');
  console.log('====================================================\n');
}

run();
