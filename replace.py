import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace exact match
    new_content = content.replace("import { motion } from 'framer-motion';", "import { m as motion } from 'framer-motion';")
    new_content = new_content.replace('import { motion } from "framer-motion";', 'import { m as motion } from "framer-motion";')
    new_content = new_content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { m as motion, AnimatePresence } from 'framer-motion';")
    new_content = new_content.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { m as motion, AnimatePresence } from "framer-motion";')
    new_content = new_content.replace("import { AnimatePresence, motion } from 'framer-motion';", "import { AnimatePresence, m as motion } from 'framer-motion';")

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            replace_in_file(os.path.join(root, file))
