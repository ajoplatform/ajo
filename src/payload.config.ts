import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    autoLogin: {
      email: 'admin@ajo.com',
      password: 'admin123',
    },
  },
  collections: [
    {
      slug: 'users',
      admin: {
        useAsTitle: 'name',
      },
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Super Admin', value: 'super_admin' },
            { label: 'Group Admin', value: 'group_admin' },
            { label: 'Member', value: 'member' },
          ],
          defaultValue: 'member',
        },
        {
          name: 'bankDetails',
          type: 'group',
          fields: [
            {
              name: 'bankName',
              type: 'text',
            },
            {
              name: 'accountNumber',
              type: 'text',
            },
            {
              name: 'accountName',
              type: 'text',
            },
          ],
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      slug: 'media',
      access: {
        read: () => true,
      },
      upload: {
        staticDir: path.resolve(dirname, '../media'),
        adminThumbnail: 'thumbnail',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'medium',
            width: 800,
            height: 600,
            position: 'centre',
          },
        ],
      },
      fields: [],
    },
    {
      slug: 'groups',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'contributionType',
          type: 'select',
          options: [
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          required: true,
        },
        {
          name: 'contributionAmount',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'currency',
          type: 'text',
          defaultValue: 'NGN',
        },
        {
          name: 'cycleDuration',
          type: 'number',
          required: true,
          admin: {
            description: 'Duration in days/weeks depending on contribution type',
          },
        },
        {
          name: 'maxMembers',
          type: 'number',
          required: true,
          min: 2,
        },
        {
          name: 'totalCycles',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'startDate',
          type: 'date',
          required: true,
        },
        {
          name: 'endDate',
          type: 'date',
        },
        {
          name: 'currentCycle',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'owner',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'admin',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Group administrator (can be different from owner)',
          },
        },
        {
          name: 'penaltySettings',
          type: 'group',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Percentage', value: 'percentage' },
                { label: 'Fixed Amount', value: 'fixed' },
              ],
            },
            {
              name: 'value',
              type: 'number',
              min: 0,
            },
            {
              name: 'gracePeriod',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Grace period in days',
              },
            },
          ],
        },
        {
          name: 'chargeSettings',
          type: 'group',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Percentage', value: 'percentage' },
                { label: 'Fixed Amount', value: 'fixed' },
              ],
            },
            {
              name: 'value',
              type: 'number',
              min: 0,
            },
          ],
        },
        {
          name: 'payoutOrder',
          type: 'select',
          options: [
            { label: 'Fixed (As assigned)', value: 'fixed' },
            { label: 'Random Draw', value: 'random' },
            { label: 'Priority Based', value: 'priority' },
            { label: 'Voting', value: 'voting' },
          ],
          defaultValue: 'fixed',
        },
        {
          name: 'isPrivate',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'inviteCode',
          type: 'text',
          unique: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'members',
          type: 'array',
          fields: [
            {
              name: 'user',
              type: 'relationship',
              relationTo: 'users',
              required: true,
            },
            {
              name: 'position',
              type: 'number',
              required: true,
            },
            {
              name: 'positions',
              type: 'number',
              defaultValue: 1,
              admin: {
                description: 'Number of positions held by this member',
              },
            },
            {
              name: 'totalContribution',
              type: 'number',
              defaultValue: 0,
            },
            {
              name: 'status',
              type: 'select',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Removed', value: 'removed' },
                { label: 'Completed', value: 'completed' },
              ],
              defaultValue: 'active',
            },
            {
              name: 'joinedAt',
              type: 'date',
              defaultValue: new Date().toISOString(),
            },
            {
              name: 'bankDetails',
              type: 'group',
              fields: [
                {
                  name: 'bankName',
                  type: 'text',
                },
                {
                  name: 'accountNumber',
                  type: 'text',
                },
                {
                  name: 'accountName',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'cycles',
      admin: {
        useAsTitle: 'cycleNumber',
      },
      fields: [
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          required: true,
        },
        {
          name: 'cycleNumber',
          type: 'number',
          required: true,
        },
        {
          name: 'startDate',
          type: 'date',
          required: true,
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
        },
        {
          name: 'expectedAmount',
          type: 'number',
        },
        {
          name: 'collectedAmount',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Processing', value: 'processing' },
            { label: 'Completed', value: 'completed' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'payoutDate',
          type: 'date',
        },
        {
          name: 'completedAt',
          type: 'date',
        },
      ],
    },
    {
      slug: 'contributions',
      admin: {
        useAsTitle: 'id',
      },
      fields: [
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          required: true,
        },
        {
          name: 'cycle',
          type: 'relationship',
          relationTo: 'cycles',
          required: true,
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'memberPosition',
          type: 'number',
          required: true,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'expectedDate',
          type: 'date',
          required: true,
        },
        {
          name: 'paidDate',
          type: 'date',
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Late', value: 'late' },
            { label: 'Defaulted', value: 'defaulted' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'isPartial',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'partialAmount',
          type: 'number',
        },
        {
          name: 'proofs',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'referenceNumber',
              type: 'text',
            },
            {
              name: 'notes',
              type: 'textarea',
            },
            {
              name: 'uploadedAt',
              type: 'date',
              defaultValue: new Date().toISOString(),
            },
            {
              name: 'status',
              type: 'select',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
              ],
              defaultValue: 'pending',
            },
            {
              name: 'reviewedAt',
              type: 'date',
            },
            {
              name: 'reviewedBy',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'reviewNotes',
              type: 'textarea',
            },
          ],
        },
      ],
    },
    {
      slug: 'payouts',
      admin: {
        useAsTitle: 'id',
      },
      fields: [
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          required: true,
        },
        {
          name: 'cycle',
          type: 'relationship',
          relationTo: 'cycles',
          required: true,
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'memberPosition',
          type: 'number',
          required: true,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'deductions',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'netAmount',
          type: 'number',
          required: true,
        },
        {
          name: 'bankDetails',
          type: 'group',
          fields: [
            {
              name: 'bankName',
              type: 'text',
            },
            {
              name: 'accountNumber',
              type: 'text',
            },
            {
              name: 'accountName',
              type: 'text',
            },
          ],
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Completed', value: 'completed' },
            { label: 'Failed', value: 'failed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'processedAt',
          type: 'date',
        },
        {
          name: 'processedBy',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    {
      slug: 'penalties',
      admin: {
        useAsTitle: 'id',
      },
      fields: [
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          required: true,
        },
        {
          name: 'contribution',
          type: 'relationship',
          relationTo: 'contributions',
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Percentage', value: 'percentage' },
            { label: 'Fixed Amount', value: 'fixed' },
          ],
          required: true,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Deducted', value: 'deducted' },
            { label: 'Waived', value: 'waived' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'waivedAt',
          type: 'date',
        },
        {
          name: 'waivedBy',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'waivedReason',
          type: 'textarea',
        },
      ],
    },
    {
      slug: 'notifications',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Contribution Due', value: 'contribution_due' },
            { label: 'Contribution Reminder', value: 'contribution_reminder' },
            { label: 'Contribution Confirmed', value: 'contribution_confirmed' },
            { label: 'Contribution Rejected', value: 'contribution_rejected' },
            { label: 'Payout Incoming', value: 'payout_incoming' },
            { label: 'Payout Completed', value: 'payout_completed' },
            { label: 'Penalty Applied', value: 'penalty_applied' },
            { label: 'Group Update', value: 'group_update' },
            { label: 'Cycle Start', value: 'cycle_start' },
            { label: 'Cycle End', value: 'cycle_end' },
            { label: 'Member Joined', value: 'member_joined' },
            { label: 'Member Left', value: 'member_left' },
          ],
          required: true,
        },
        {
          name: 'data',
          type: 'json',
        },
        {
          name: 'isRead',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'readAt',
          type: 'date',
        },
      ],
    },
  ],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: {
      url: `file:${path.resolve(dirname, '../db/payload.db')}`,
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['groups'],
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: true,
  },
  cors: ['*'],
  csrf: ['*'],
})
