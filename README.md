# CEGOS Env Switcher

Extension Chrome interne pour basculer rapidement entre :
- production
- preproduction
- localhost

## Structure du projet

- `extension/` : code de l’extension Chrome
- `site/` : site vitrine publié via GitHub Pages
- `scripts/package-extension.sh` : génère le zip de l’extension
- `.github/workflows/deploy-pages.yml` : pipeline de déploiement Pages

## Développement local

### Extension
1. Ouvrir `chrome://extensions`
2. Activer le mode développeur
3. Cliquer sur **Load unpacked**
4. Sélectionner le dossier `extension/`

### Site
Le site est statique. Ouvrir `site/index.html` dans un navigateur.

## Packaging

```bash
bash scripts/package-extension.sh
