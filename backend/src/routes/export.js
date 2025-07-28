const express = require('express');
const JSZip = require('jszip');
const { auth } = require('../middleware/auth');
const Session = require('../models/Session');

const router = express.Router();

// Export component as ZIP
router.post('/zip', auth, async (req, res) => {
  try {
    const { sessionId, componentName = 'Component' } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { jsx, css } = session.currentComponent;

    if (!jsx) {
      return res.status(400).json({ error: 'No component to export' });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Add JSX/TSX file
    const jsxFileName = `${componentName}.tsx`;
    zip.file(jsxFileName, jsx);

    // Add CSS file
    if (css) {
      const cssFileName = `${componentName}.css`;
      zip.file(cssFileName, css);
    }

    // Add package.json for React project
    const packageJson = {
      name: componentName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `Generated component: ${componentName}`,
      main: `${componentName}.tsx`,
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        typescript: '^4.9.0'
      }
    };

    zip.file('package.json', JSON.stringify(packageJson, null, 2));

    // Add README
    const readme = `# ${componentName}

This component was generated using the AI Component Generator Platform.

## Usage

\`\`\`tsx
import { ${componentName} } from './${componentName}';

function App() {
  return (
    <div>
      <${componentName} />
    </div>
  );
}
\`\`\`

## Files

- \`${componentName}.tsx\` - The main component file
- \`${componentName}.css\` - Component styles (if applicable)

## Installation

\`\`\`bash
npm install
\`\`\`

Generated on: ${new Date().toISOString()}
`;

    zip.file('README.md', readme);

    // Add TypeScript config
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['DOM', 'DOM.Iterable', 'ES6'],
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noFallthroughCasesInSwitch: true,
        module: 'ESNext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx'
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules']
    };

    zip.file('tsconfig.json', JSON.stringify(tsConfig, null, 2));

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${componentName}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.send(zipBuffer);

  } catch (error) {
    console.error('Export ZIP error:', error);
    res.status(500).json({ error: 'Failed to export component' });
  }
});

// Get component code for copying
router.get('/code/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'full' } = req.query; // 'full', 'jsx', 'css'

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { jsx, css } = session.currentComponent;

    if (!jsx) {
      return res.status(400).json({ error: 'No component to export' });
    }

    let code = '';

    switch (format) {
      case 'jsx':
        code = jsx;
        break;
      case 'css':
        code = css || '';
        break;
      case 'full':
      default:
        code = `// ${session.title}\n\n`;
        if (jsx) {
          code += `// JSX/TSX Component\n\`\`\`tsx\n${jsx}\n\`\`\`\n\n`;
        }
        if (css) {
          code += `// CSS Styles\n\`\`\`css\n${css}\n\`\`\`\n\n`;
        }
        code += `// Generated on: ${new Date().toISOString()}`;
        break;
    }

    res.json({
      code,
      format,
      sessionTitle: session.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Export code error:', error);
    res.status(500).json({ error: 'Failed to export code' });
  }
});

// Export multiple components as ZIP
router.post('/zip/multiple', auth, async (req, res) => {
  try {
    const { sessionIds, projectName = 'Components' } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: 'Session IDs array is required' });
    }

    const sessions = await Session.find({
      _id: { $in: sessionIds },
      userId: req.user._id,
      isActive: true
    });

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found' });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Add each component
    for (const session of sessions) {
      const { jsx, css } = session.currentComponent;
      
      if (jsx) {
        const componentName = session.title.replace(/[^a-zA-Z0-9]/g, '');
        const jsxFileName = `components/${componentName}.tsx`;
        zip.file(jsxFileName, jsx);

        if (css) {
          const cssFileName = `styles/${componentName}.css`;
          zip.file(cssFileName, css);
        }
      }
    }

    // Add package.json
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `Generated components: ${projectName}`,
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        typescript: '^4.9.0'
      }
    };

    zip.file('package.json', JSON.stringify(packageJson, null, 2));

    // Add README
    const readme = `# ${projectName}

This project contains components generated using the AI Component Generator Platform.

## Components

${sessions.map(s => `- ${s.title}`).join('\n')}

## Installation

\`\`\`bash
npm install
\`\`\`

Generated on: ${new Date().toISOString()}
`;

    zip.file('README.md', readme);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.send(zipBuffer);

  } catch (error) {
    console.error('Export multiple ZIP error:', error);
    res.status(500).json({ error: 'Failed to export components' });
  }
});

// Export session as JSON (for backup/import)
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      session: {
        title: session.title,
        description: session.description,
        messages: session.messages,
        currentComponent: session.currentComponent,
        componentHistory: session.componentHistory,
        settings: session.settings,
        tags: session.tags
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${session.title}.json"`);
    
    res.json(exportData);

  } catch (error) {
    console.error('Export session error:', error);
    res.status(500).json({ error: 'Failed to export session' });
  }
});

module.exports = router; 