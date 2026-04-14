const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'src', 'generated', 'client'));
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Module definitions with their system fields
const MODULES = [
  {
    slug: 'company',
    name: 'Companies',
    icon: 'Building2',
    sortOrder: 1,
    fields: [
      { name: 'name', label: 'Company Name', fieldType: 'TEXT', isRequired: true, section: 'Basic Info', sortOrder: 1 },
      { name: 'status', label: 'Status', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 2, options: JSON.stringify(['Prospect', 'Under Review', 'In Due Diligence', 'Offer Made', 'Closed', 'Passed', 'Portfolio']) },
      { name: 'parentId', label: 'Parent Company', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 3 },
      { name: 'industry', label: 'Industry', fieldType: 'TEXT', section: 'Basic Info', sortOrder: 4, placeholder: 'e.g. SaaS, Manufacturing' },
      { name: 'website', label: 'Website', fieldType: 'URL', section: 'Basic Info', sortOrder: 5, placeholder: 'https://...' },
      { name: 'location', label: 'Location', fieldType: 'TEXT', section: 'Basic Info', sortOrder: 6, placeholder: 'City, State/Province' },
      { name: 'revenue', label: 'Revenue', fieldType: 'TEXT', section: 'Financial', sortOrder: 7, placeholder: 'e.g. $5M-$10M' },
      { name: 'employeeCount', label: 'Employees', fieldType: 'TEXT', section: 'Financial', sortOrder: 8, placeholder: 'e.g. 50-100' },
      { name: 'description', label: 'Description', fieldType: 'TEXTAREA', section: 'Details', sortOrder: 9 },
      { name: 'notes', label: 'Notes', fieldType: 'TEXTAREA', section: 'Details', sortOrder: 10 },
    ],
  },
  {
    slug: 'contact',
    name: 'Contacts',
    icon: 'Users',
    sortOrder: 2,
    fields: [
      { name: 'firstName', label: 'First Name', fieldType: 'TEXT', isRequired: true, section: 'Basic Info', sortOrder: 1 },
      { name: 'lastName', label: 'Last Name', fieldType: 'TEXT', isRequired: true, section: 'Basic Info', sortOrder: 2 },
      { name: 'companyId', label: 'Company', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 3 },
      { name: 'role', label: 'Role', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 4, options: JSON.stringify(['Owner', 'CEO', 'CFO', 'Broker', 'Advisor', 'Employee', 'Board Member', 'Other']) },
      { name: 'email', label: 'Email', fieldType: 'EMAIL', section: 'Contact Info', sortOrder: 5, placeholder: 'email@example.com' },
      { name: 'phone', label: 'Phone', fieldType: 'PHONE', section: 'Contact Info', sortOrder: 6, placeholder: '+1 (555) 000-0000' },
      { name: 'title', label: 'Job Title', fieldType: 'TEXT', section: 'Contact Info', sortOrder: 7, placeholder: 'e.g. VP of Operations' },
      { name: 'linkedIn', label: 'LinkedIn', fieldType: 'URL', section: 'Contact Info', sortOrder: 8, placeholder: 'https://linkedin.com/in/...' },
      { name: 'notes', label: 'Notes', fieldType: 'TEXTAREA', section: 'Details', sortOrder: 9 },
    ],
  },
  {
    slug: 'deal',
    name: 'Deals',
    icon: 'Handshake',
    sortOrder: 3,
    fields: [
      { name: 'name', label: 'Deal Name', fieldType: 'TEXT', isRequired: true, section: 'Basic Info', sortOrder: 1 },
      { name: 'companyId', label: 'Company', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 2 },
      { name: 'stage', label: 'Stage', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 3, options: JSON.stringify(['Lead', 'Initial Contact', 'NDA Signed', 'Due Diligence', 'LOI', 'Negotiation', 'Closed Won', 'Closed Lost']) },
      { name: 'priority', label: 'Priority', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 4, options: JSON.stringify(['Low', 'Medium', 'High', 'Critical']) },
      { name: 'askingPrice', label: 'Asking Price', fieldType: 'DECIMAL', section: 'Financial', sortOrder: 5 },
      { name: 'revenue', label: 'Revenue', fieldType: 'DECIMAL', section: 'Financial', sortOrder: 6 },
      { name: 'ebitda', label: 'EBITDA', fieldType: 'DECIMAL', section: 'Financial', sortOrder: 7 },
      { name: 'currency', label: 'Currency', fieldType: 'TEXT', section: 'Financial', sortOrder: 8 },
      { name: 'expectedCloseDate', label: 'Expected Close Date', fieldType: 'DATE', section: 'Details', sortOrder: 9 },
      { name: 'source', label: 'Source', fieldType: 'TEXT', section: 'Details', sortOrder: 10, placeholder: 'How we found this deal' },
      { name: 'notes', label: 'Notes', fieldType: 'TEXTAREA', section: 'Details', sortOrder: 11 },
    ],
  },
  {
    slug: 'activity',
    name: 'Activities',
    icon: 'Activity',
    sortOrder: 4,
    fields: [
      { name: 'subject', label: 'Subject', fieldType: 'TEXT', isRequired: true, section: 'Basic Info', sortOrder: 1 },
      { name: 'type', label: 'Type', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 2, options: JSON.stringify(['Note', 'Call', 'Email', 'Meeting', 'Site Visit', 'Other']) },
      { name: 'date', label: 'Date', fieldType: 'DATE', section: 'Basic Info', sortOrder: 3 },
      { name: 'dealId', label: 'Deal', fieldType: 'SELECT', section: 'Linked To', sortOrder: 4 },
      { name: 'contactId', label: 'Contact', fieldType: 'SELECT', section: 'Linked To', sortOrder: 5 },
      { name: 'companyId', label: 'Company', fieldType: 'SELECT', section: 'Linked To', sortOrder: 6 },
      { name: 'description', label: 'Description', fieldType: 'TEXTAREA', section: 'Details', sortOrder: 7 },
    ],
  },
  {
    slug: 'reminder',
    name: 'Reminders',
    icon: 'Bell',
    sortOrder: 5,
    fields: [
      { name: 'title', label: 'Title', fieldType: 'TEXT', isRequired: true, section: 'Basic Info', sortOrder: 1 },
      { name: 'dueDate', label: 'Due Date', fieldType: 'DATE', isRequired: true, section: 'Basic Info', sortOrder: 2 },
      { name: 'priority', label: 'Priority', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 3, options: JSON.stringify(['Low', 'Medium', 'High', 'Urgent']) },
      { name: 'status', label: 'Status', fieldType: 'SELECT', section: 'Basic Info', sortOrder: 4, options: JSON.stringify(['Pending', 'In Progress', 'Completed', 'Cancelled']) },
      { name: 'dealId', label: 'Deal', fieldType: 'SELECT', section: 'Linked To', sortOrder: 5 },
      { name: 'contactId', label: 'Contact', fieldType: 'SELECT', section: 'Linked To', sortOrder: 6 },
      { name: 'companyId', label: 'Company', fieldType: 'SELECT', section: 'Linked To', sortOrder: 7 },
      { name: 'description', label: 'Description', fieldType: 'TEXTAREA', section: 'Details', sortOrder: 8 },
    ],
  },
];

async function main() {
  for (const mod of MODULES) {
    const created = await prisma.crmModule.upsert({
      where: { slug: mod.slug },
      update: { name: mod.name, icon: mod.icon, sortOrder: mod.sortOrder },
      create: {
        slug: mod.slug,
        name: mod.name,
        icon: mod.icon,
        sortOrder: mod.sortOrder,
      },
    });

    for (const field of mod.fields) {
      await prisma.moduleField.upsert({
        where: { moduleId_name: { moduleId: created.id, name: field.name } },
        update: {
          label: field.label,
          fieldType: field.fieldType,
          isRequired: field.isRequired || false,
          sortOrder: field.sortOrder,
          options: field.options || null,
          placeholder: field.placeholder || null,
          section: field.section || null,
        },
        create: {
          moduleId: created.id,
          name: field.name,
          label: field.label,
          fieldType: field.fieldType,
          isSystem: true,
          isRequired: field.isRequired || false,
          isVisible: true,
          sortOrder: field.sortOrder,
          options: field.options || null,
          placeholder: field.placeholder || null,
          section: field.section || null,
        },
      });
    }

    console.log(`✓ ${mod.name}: ${mod.fields.length} system fields`);
  }

  // Set the owner user role
  const updated = await prisma.user.updateMany({
    where: { email: 'alexandredesmarais88@gmail.com' },
    data: { role: 'OWNER' },
  });
  console.log(`✓ Set ${updated.count} user(s) to OWNER role`);
}

main()
  .then(() => { prisma.$disconnect(); pool.end(); })
  .catch((e) => { console.error(e); prisma.$disconnect(); pool.end(); process.exit(1); });
