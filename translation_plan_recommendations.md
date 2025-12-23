# Translation Plan & Recommendations

## Decision: Implement i18n NOW

**Required Languages:**
- Spanish + English: **NOW** (immediate business need)
- French: **SOON**
- Italian + others: **MAYBE** (future consideration)

## Why Now is the Right Time

1. **Immediate business need** - ES + EN required now
2. **French is coming** - better to have infrastructure ready
3. **Codebase is still manageable** - easier to implement before more features
4. **Before SaaS complexity** - adding users/companies/subscriptions will make this harder
5. **Every new feature will be multilingual from day one** after implementation

## Recommended Technology Stack

**Use `next-intl`**

Best choice for Next.js App Router because:
- Type-safe translations
- Server + client components support
- URL-based locale routing (`/es/dashboard`, `/en/dashboard`)
- Excellent developer experience
- Great documentation and community support

## Implementation Plan

### Phase 1: Setup (2-3 hours)
1. Install and configure next-intl
2. Set up routing structure (`/[locale]/...`)
3. Create translation file structure
4. Add language switcher component

### Phase 2: Extract Strings (4-6 hours)
5. Extract all hardcoded strings from components
6. Translate to Spanish/English (requires native speaker input)
7. Handle dates, numbers, currency formatting (€)

### Phase 3: Special Cases (2-3 hours)
8. Database content strategy (boat names, customer data - likely stays as-is)
9. Emails/notifications translation
10. Error messages from Supabase
11. Toast notifications

## Scope Estimate

Based on current codebase analysis:
- ~15-20 main pages
- ~30-40 components with UI text
- Form labels, buttons, validation messages
- Toast notifications
- Email templates (if applicable)
- Error messages

**Total Estimated Effort: 8-12 hours development work** + time for translations

## Cost Analysis

### Adding Now vs Later

**Cost if added NOW:**
- Initial setup: 8-12 hours
- Maintenance: Small incremental cost per feature

**Cost if added LATER (after SaaS phase):**
- Retrofitting: 40-60 hours (5-10x more work)
- More features to migrate
- Potential architectural refactoring
- Database schema changes
- More components to update
- Higher risk of bugs

## Translation File Structure (Proposed)

```
messages/
├── en.json
├── es.json
├── fr.json (when ready)
└── it.json (when ready)
```

Each file organized by feature:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back"
  },
  "bookings": {
    "new": "New Booking",
    "customer": "Customer"
  }
}
```

## URL Structure

```
/en/dashboard
/en/bookings
/en/quick-book

/es/dashboard
/es/bookings
/es/quick-book

/fr/dashboard (future)
/fr/bookings (future)
```

## Special Considerations

### Database Content
- **Customer names, emails, phone numbers**: Remain as-is (user data)
- **Boat names**: Remain as-is (proper nouns)
- **Notes/comments**: User-generated, stay in original language
- **Package types**: Translate in UI layer, store as keys in DB

### Date & Number Formatting
- Dates: Locale-specific (DD/MM/YYYY for ES, MM/DD/YYYY for EN, etc.)
- Currency: Always € (Euro) but formatted per locale
- Time: 24-hour format (standard for Mediterranean region)

### Email Notifications
- Use recipient's preferred language (store in user profile)
- Fallback to company default language
- Support template variables that work across languages

## Migration Strategy

### For Each Component:
1. Identify all hardcoded strings
2. Extract to translation keys
3. Replace with `t('key')` calls
4. Test in both languages
5. Verify layout doesn't break with longer strings

### Priority Order:
1. **High Priority** (customer-facing):
   - Quick book page
   - Customer portal
   - Booking confirmation
   - Email notifications

2. **Medium Priority** (agent-facing):
   - Dashboard
   - Bookings list
   - Calendar view
   - Fleet management

3. **Low Priority** (admin):
   - Settings
   - Reports
   - User management

## Testing Strategy

- Test with longest language (typically German, but Spanish can be long too)
- Verify UI doesn't break with longer text
- Check right-to-left isn't needed (not for ES/EN/FR/IT)
- Test language switching doesn't lose state
- Verify browser language detection works
- Test URL routing for all locales

## Maintenance Plan

### After Implementation:
- Every new feature includes translations from start
- Add new keys to all language files simultaneously
- Use TypeScript to catch missing translations
- Review translations quarterly for consistency
- Consider professional translation service for customer-facing content

## Next Steps

**Option 1: Start with Setup**
- Implement basic infrastructure
- Show working prototype
- Decide on full implementation

**Option 2: Full Implementation**
- Complete all phases
- Provide translation keys
- Native speakers provide translations

**Option 3: Detailed Planning**
- Create comprehensive implementation plan
- Review and approve before starting

## Recommendation

**Proceed with full implementation NOW.**

The business need is clear, the codebase size is manageable, and delaying will only increase costs. The infrastructure will pay for itself as soon as French support is needed.

## Resources Needed

1. **Development**: 8-12 hours (developer time)
2. **Translations**:
   - Spanish: Native speaker for ~200-300 strings
   - English: Native speaker for ~200-300 strings
   - French: Can wait until infrastructure is ready
3. **Review**: Native speakers to verify translations in context
4. **Testing**: 2-3 hours across all languages

## Risk Assessment

**Risks of Implementing Now:**
- ⚠️ Slight slowdown in feature development during migration
- ⚠️ Need quality translations (poor translations worse than no translations)
- ⚠️ Initial learning curve for developers

**Risks of Waiting:**
- 🔴 5-10x more work to retrofit later
- 🔴 Harder to change URL structure after users have bookmarks
- 🔴 Database schema may need changes
- 🔴 Missing business opportunities in other markets
- 🔴 Inconsistent translation quality if done piecemeal

## Success Metrics

- ✅ All customer-facing pages in ES + EN
- ✅ Language switcher in all layouts
- ✅ Correct locale-specific date/number formatting
- ✅ No hardcoded strings in components
- ✅ Type-safe translation keys
- ✅ Email notifications in recipient's language
- ✅ Ready for French addition in < 1 day of work

---

**Status**: Planning Phase
**Decision**: Implement NOW
**Recommended Library**: next-intl
**Estimated Effort**: 8-12 hours + translations
**Priority**: HIGH
