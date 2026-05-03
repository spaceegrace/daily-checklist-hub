# Daily Goals Hub

A beautiful, interactive web application for managing daily, monthly, and yearly goals with a modern dark theme interface.

## Features

✨ **Daily Goals Management**
- Add, complete, and delete daily goals
- Real-time progress tracking with progress bar
- Clear completed or all goals at once
- Track daily goal completion percentage

📅 **Monthly Goals**
- Organized monthly goal tracking
- Progress indicator
- Persistent storage

🎯 **Yearly Goals**
- Long-term goal planning
- Progress tracking
- Persistent storage

💾 **Local Storage**
- All goals are automatically saved to your browser's local storage
- Your data persists even after closing and reopening the page
- No server or internet connection required

🎨 **Modern UI**
- Beautiful dark theme with gradient accents
- Smooth animations and transitions
- Responsive design for desktop, tablet, and mobile
- Clean and intuitive interface

⚡ **Interactive Features**
- Real-time progress bars with percentage tracking
- Current date display
- Checkbox completion tracking
- Delete individual goals
- Bulk actions (clear completed, clear all)

## How to Use

1. **Open the page** - Open `index.html` in your web browser
2. **Add Daily Goals** - Type a goal in the "Add a new daily goal" field and click "+ Add Goal" or press Enter
3. **Track Progress** - Check the checkbox to mark a goal as complete
4. **Monthly/Yearly Goals** - Add long-term goals in the sidebar sections
5. **Clear Goals** - Use the action buttons to clear completed or all goals
6. **Delete Individual Goals** - Click the "Delete" button on any goal

## Live Demo

🌐 **https://spaceegrace.github.io/daily-checklist-hub/**

## Files

- `index.html` - Main HTML structure
- `styles.css` - Complete styling with dark theme and responsive design
- `script.js` - JavaScript functionality and local storage management
- `README.md` - This file

## Browser Support

Works on all modern browsers including:
- Chrome/Edge (88+)
- Firefox (78+)
- Safari (14+)
- Opera (74+)

## Local Storage

Your goals are automatically saved to your browser's local storage. To clear all data:
1. Open browser developer tools (F12 or Right-click > Inspect)
2. Go to Application/Storage tab
3. Find "goalsHub" in Local Storage
4. Delete it

Or clear it programmatically in the console:
```javascript
localStorage.removeItem('goalsHub');
```

## Customization

You can customize the theme by editing the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #ec4899;    /* Secondary accent */
    --success-color: #10b981;      /* Completion/success color */
    --danger-color: #ef4444;       /* Delete button color */
    --bg-primary: #0f172a;         /* Main background */
    --bg-secondary: #1e293b;       /* Section background */
    /* ... and more */
}
```

## Tips for Best Results

- ✅ Review your daily goals each morning
- ✅ Check off completed goals to maintain motivation
- ✅ Break down yearly goals into monthly milestones
- ✅ Use clear, specific goal descriptions
- ✅ Update your goals regularly
- ✅ Celebrate completed goals!

## License

Free to use and modify for personal projects.

Enjoy tracking your goals! 🎉