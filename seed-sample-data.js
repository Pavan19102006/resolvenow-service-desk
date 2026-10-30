#!/usr/bin/env node

/**
 * Seed Script for ResolveNow Microservices Platform
 * Registers sample users across all categories (Customer, Staff, Admin)
 * and lodges realistic complaints with varied departments, priorities, and statuses.
 */

const TARGET_URL = process.env.BACKEND_URL || 'https://resolvenow-service-desk.onrender.com';

const SAMPLE_USERS = [
  // 1. Customer Category
  {
    username: 'john',
    password: 'pass123',
    email: 'john@example.com',
    role: 'USER',
    label: 'Customer (John)'
  },
  {
    username: 'alex_customer',
    password: 'customer123',
    email: 'alex.customer@techcorp.io',
    role: 'USER',
    label: 'Enterprise Customer (Alex)'
  },
  {
    username: 'emily_user',
    password: 'emily123',
    email: 'emily.turner@globex.org',
    role: 'USER',
    label: 'Retail Customer (Emily)'
  },

  // 2. Company Staff Category
  {
    username: 'sarah_staff',
    password: 'staff123',
    email: 'sarah.tech@resolvenow.io',
    role: 'STAFF',
    department: 'TECHNICAL',
    label: 'Tech Support Engineer (Sarah)'
  },
  {
    username: 'mike_billing',
    password: 'billing123',
    email: 'mike.billing@resolvenow.io',
    role: 'STAFF',
    department: 'BILLING',
    label: 'Billing Specialist (Mike)'
  },
  {
    username: 'david_support',
    password: 'support123',
    email: 'david.support@resolvenow.io',
    role: 'STAFF',
    department: 'GENERAL_SUPPORT',
    label: 'Customer Support Lead (David)'
  },

  // 3. Administrator Category
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@resolvenow.io',
    role: 'ADMIN',
    label: 'System Administrator (Admin)'
  }
];

const SAMPLE_COMPLAINTS = [
  {
    title: 'Double charge on annual Enterprise subscription renewal',
    description: 'Invoice #INV-9281 was billed twice to our corporate AMEX ($2,400 x 2). Account shows renewal pending and finance team requires immediate reversal.',
    category: 'BILLING',
    priority: 'HIGH',
    targetStatus: 'IN_PROGRESS'
  },
  {
    title: 'Production Webhook delivery failure (HTTP 502 Bad Gateway)',
    description: 'Webhook events for order completion have failed for the past 45 minutes across all customer endpoints. Retries are getting dropped by proxy.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    targetStatus: 'OPEN'
  },
  {
    title: 'High latency and DB connection timeouts during peak traffic',
    description: 'API Gateway response times degraded from 45ms to 1800ms. HikariCP connection pool reporting exhaustion under concurrent query load.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    targetStatus: 'IN_PROGRESS'
  },
  {
    title: 'Unable to reset two-factor authenticator after mobile migration',
    description: 'Employee lost access to Google Authenticator device. Backup codes are not prompting on the security verification screen.',
    category: 'GENERAL',
    priority: 'MEDIUM',
    targetStatus: 'RESOLVED'
  },
  {
    title: 'Request for revised EU VAT invoice with reverse-charge compliance',
    description: 'Please update invoice #INV-8812 with our newly verified VAT ID (DE382910482) and re-issue the PDF credit note.',
    category: 'BILLING',
    priority: 'LOW',
    targetStatus: 'RESOLVED'
  },
  {
    title: 'API documentation missing response schema for batch ticket creation',
    description: 'Developer portal OpenAPI spec does not specify whether bulk complaints accept arrays or JSON-lines format.',
    category: 'INQUIRY',
    priority: 'LOW',
    targetStatus: 'CLOSED'
  },
  {
    title: 'SAML assertion signing certificate expired on Okta IdP',
    description: 'Single Sign-On login throws "Invalid signature in SAMLResponse" error for all users in the engineering organizational unit.',
    category: 'TECHNICAL',
    priority: 'HIGH',
    targetStatus: 'IN_PROGRESS'
  },
  {
    title: 'Corporate credit card expired - update billing primary contact',
    description: 'Need to transfer primary billing admin to accounting@resolvenow.io before the monthly cycle recharges.',
    category: 'BILLING',
    priority: 'MEDIUM',
    targetStatus: 'OPEN'
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

async function seed() {
  console.log('====================================================');
  console.log(`Starting Data Seeding against: ${TARGET_URL}`);
  console.log('====================================================\n');

  // Step 1: Register Sample Users
  console.log('--- Step 1: Registering Sample Users in Each Category ---');
  for (const u of SAMPLE_USERS) {
    try {
      const reg = await postJson(`${TARGET_URL}/auth/register`, {
        username: u.username,
        password: u.password,
        email: u.email,
        role: u.role
      });
      if (reg.ok || reg.status === 201) {
        console.log(`✓ [${u.role}] Created: ${u.username} (${u.label})`);
      } else if (reg.status === 409 || (reg.data && JSON.stringify(reg.data).includes('already taken'))) {
        console.log(`• [${u.role}] Already exists: ${u.username}`);
      } else {
        console.log(`! [${u.role}] ${u.username}: HTTP ${reg.status}`);
      }
    } catch (err) {
      console.error(`✗ Error creating user ${u.username}:`, err.message);
    }
  }

  // Step 2: Login as Customer to Obtain JWT
  console.log('\n--- Step 2: Authenticating as Customer (john) ---');
  let token = null;
  try {
    const login = await postJson(`${TARGET_URL}/auth/login`, {
      username: 'john',
      password: 'pass123'
    });
    if (login.ok && login.data?.token) {
      token = login.data.token;
      console.log(`✓ Authentication successful! JWT token acquired.`);
    } else {
      console.error('✗ Login failed for john:', login.data);
      // Fallback: try alex_customer
      const login2 = await postJson(`${TARGET_URL}/auth/login`, {
        username: 'alex_customer',
        password: 'customer123'
      });
      if (login2.ok && login2.data?.token) {
        token = login2.data.token;
        console.log(`✓ Fallback authentication successful with alex_customer!`);
      }
    }
  } catch (err) {
    console.error('✗ Authentication error:', err.message);
  }

  if (!token) {
    console.error('Cannot lodge complaints without a valid JWT token. Aborting complaint lodging.');
    return;
  }

  // Step 3: Lodge Sample Complaints
  console.log('\n--- Step 3: Lodging Sample Complaints with Automated Department Routing ---');
  const createdTickets = [];

  for (const c of SAMPLE_COMPLAINTS) {
    try {
      const res = await postJson(`${TARGET_URL}/complaints`, {
        title: c.title,
        description: c.description,
        category: c.category,
        priority: c.priority,
        userId: 1
      }, token);

      if (res.ok || res.status === 201) {
        const ticket = res.data;
        const id = ticket.id;
        const dept = ticket.assignment?.department || 'GENERAL_SUPPORT';
        const agent = ticket.assignment?.assignedTo || 'Auto-Allocated';
        console.log(`✓ Created Ticket #${id}: "${c.title.substring(0, 45)}..." -> Dept: [${dept}] | Agent: [${agent}]`);

        // If targetStatus is not OPEN, update status
        if (c.targetStatus && c.targetStatus !== 'OPEN') {
          const updateRes = await putRequest(`${TARGET_URL}/complaints/${id}/status?status=${c.targetStatus}`, token);
          if (updateRes.ok) {
            console.log(`   ↳ Transitioned status to: ${c.targetStatus}`);
          }
        }
        createdTickets.push(ticket);
      } else {
        console.log(`! Failed to create ticket "${c.title}": HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`✗ Error lodging complaint:`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log(`✓ Data Seeding Complete! ${createdTickets.length} tickets populated across categories.`);
  console.log('====================================================\n');
}

seed();
