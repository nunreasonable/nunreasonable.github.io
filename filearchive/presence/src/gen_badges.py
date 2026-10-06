#!/usr/bin/env python3
"""Gera os .src.html dos badges de linguagem/SO a partir de badge.template.html.

Chamado por render.sh antes de abrir o Firefox. Idempotente: sempre
sobrescreve lang/*.src.html e os/*.src.html com o resultado atual das tabelas
abaixo, entao rodar de novo depois de editar um rotulo so exige ./render.sh.

O tamanho da fonte cai com o numero de caracteres do rotulo para o texto
nunca estourar o disco (r=49 de area util) - ver FONT_SIZES.
"""

import html
import os

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(HERE, "badge.template.html")

# len(label) -> (font-size px, letter-spacing px)
FONT_SIZES = {
    1: (54, "0"),
    2: (46, "0"),
    3: (36, "0"),
    4: (28, "-0.5"),
}


def metrics_for(label):
    n = len(label)
    if n in FONT_SIZES:
        return FONT_SIZES[n]
    # Rotulo mais longo que o previsto: encolhe progressivamente em vez de
    # estourar o disco.
    return (max(14, 28 - 4 * (n - 4)), "-0.5")


# Rotulo proprio, nao sigla oficial de marca - ver contrato em presence.json
# e no comentario desta tarefa (badges sao arte nossa, nao logo de terceiro).
LANG_LABELS = {
    "csharp": "C#",
    "cpp": "C++",
    "c": "C",
    "rust": "RS",
    "python": "PY",
    "javascript": "JS",
    "typescript": "TS",
    "luau": "LUAU",
    "lua": "LUA",
    "html": "HTML",
    "css": "CSS",
    "shell": "SH",
    "qml": "QML",
    "go": "GO",
    "java": "JAVA",
    "kotlin": "KT",
    "markdown": "MD",
    "generic": "</>",
}

OS_LABELS = {
    "windows11": "W11",
    "windows10": "W10",
    "windows": "WIN",
    "gentoo": "GEN",
    "fedora": "FED",
    "ubuntu": "UBU",
    "debian": "DEB",
    "arch": "ARCH",
    "linux": "LNX",
    "macos": "MAC",
    "freebsd": "BSD",
    "generic": "OS",
}


def write_group(group_name, labels):
    out_dir = os.path.join(HERE, group_name)
    os.makedirs(out_dir, exist_ok=True)
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as fh:
        template = fh.read()

    written = []
    for badge_id, label in labels.items():
        font_size, letter_spacing = metrics_for(label)
        # html.escape: alguns rotulos (ex. "</>" do generic) tem caracteres
        # que o parser HTML do Firefox le como marcacao se forem colados
        # crus dentro do <text>...</text> - sem isso o texto sumia.
        page = (
            template.replace("__ID__", f"{group_name}/{badge_id}")
            .replace("__FONT_SIZE__", str(font_size))
            .replace("__LETTER_SPACING__", letter_spacing)
            .replace("__LABEL__", html.escape(label))
        )
        out_path = os.path.join(out_dir, f"{badge_id}.src.html")
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(page)
        written.append(badge_id)
    return written


def main():
    lang_ids = write_group("lang", LANG_LABELS)
    os_ids = write_group("os", OS_LABELS)
    print(f"lang: {len(lang_ids)} badges -> {', '.join(lang_ids)}")
    print(f"os: {len(os_ids)} badges -> {', '.join(os_ids)}")


if __name__ == "__main__":
    main()
