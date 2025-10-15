import random
import comfy
import nodes
import json
import re

class PromptTemplateJson:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "optional":{
                "clip": ("CLIP",),
                "template_positive": ("STRING", {
                    "default": "A *obj on a *place",
                    "multiline": True,
                    "dynamicPrompts": True,
                    "placeholder": "Template positive prompt"
                    }),
                "template_negative": ("STRING", {
                    "default": '',
                    "multiline": True,
                    "dynamicPrompts": True,
                    "placeholder": "Template negative prompt"
                    }),
                "variables_json": ("STRING", {"default": '{"obj": "cat", "place": "table"}', "multiline": True}),
            }
        }
        
    RETURN_TYPES = ("CONDITIONING","CONDITIONING","STRING","STRING","STRING",)
    RETURN_NAMES = ("positive", "negative", "positive", "negative", "json",)
    FUNCTION = "execute"
    CATEGORY = "MIM_Prompts"

    def execute(self, clip=None, template_positive="", template_negative="", variables_json="{}"):
        try:
            variables = json.loads(variables_json)
        except json.JSONDecodeError:
            variables = {}

        def replace_vars(text):
            if not text:
                return text
            result = text
            for var_name, value in variables.items():
                placeholder = f"*{var_name}"
                result = result.replace(placeholder, str(value))
            return result

        pos_prompt = replace_vars(template_positive)
        neg_prompt = replace_vars(template_negative)

        if(clip):
            pos_cond, pos_pooled = clip.encode_from_tokens(clip.tokenize(pos_prompt), return_pooled=True)
            neg_cond, neg_pooled = clip.encode_from_tokens(clip.tokenize(neg_prompt), return_pooled=True)
        else:
            pos_cond, pos_pooled = None, None
            neg_cond, neg_pooled = None, None
        
        return ([[pos_cond, {"pooled_output": pos_pooled}]], [[neg_cond, {"pooled_output": neg_pooled}]], pos_prompt, neg_prompt, variables_json)

class PromptTemplateKeyValue:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "clip": ("CLIP",),
            },
            "optional": {
                "template_positive": ("STRING", {"default": "A *obj on a *place", "multiline": True}),
                "template_negative": ("STRING", {"default": '', "multiline": True}),
                "variables": ("STRING", {
                    "default": "obj=cat\nplace=wooden table\nstyle=photorealistic",
                    "multiline": True,
                    "placeholder": "key=value\nkey2=value2"
                }),
            }
        }
        
    RETURN_TYPES = ("CONDITIONING","CONDITIONING","STRING","STRING",)
    RETURN_NAMES = ("positive", "negative", "positive", "negative",)
    FUNCTION = "execute"
    CATEGORY = "MIM_Prompts"

    def execute(self, clip, template_positive, template_negative="", variables=""):
        var_dict = {}
        if variables.strip():
            for line in variables.strip().splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, value = line.split("=", 1)
                    var_dict[key.strip()] = value.strip()

        def replace_vars(text):
            if not text:
                return text
            result = text
            for var_name, value in var_dict.items():
                placeholder = f"*{var_name}"
                result = result.replace(placeholder, str(value))
            return result

        pos_prompt = replace_vars(template_positive)
        neg_prompt = replace_vars(template_negative)

        pos_tokens = clip.tokenize(pos_prompt)
        neg_tokens = clip.tokenize(neg_prompt)

        pos_cond, pos_pooled = clip.encode_from_tokens(pos_tokens, return_pooled=True)
        neg_cond, neg_pooled = clip.encode_from_tokens(neg_tokens, return_pooled=True)

        return (
            [[pos_cond, {"pooled_output": pos_pooled}]],
            [[neg_cond, {"pooled_output": neg_pooled}]],
            pos_prompt,
            neg_prompt
        )
class PromptTemplateGetManyRandomTemplates:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "optional": {
                "TemplatesParts": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "placeholder": "value\nvalue2\nvalue3"
                }),
                "Count": ("INT", {"default": 1, "min": 1, "max": 1000}),
            }
        }
        
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("template",)
    FUNCTION = "execute"
    CATEGORY = "MIM_Prompts"

    def execute(self, TemplatesParts="", Count=1, **kwargs):
        if not TemplatesParts:
            return ("",)

        lines = [line.strip() for line in TemplatesParts.splitlines() if line.strip()]
        unique_templates = list(dict.fromkeys(lines))

        if not unique_templates:
            return ("",)

        actual_count = min(Count, len(unique_templates))

        selected = random.sample(unique_templates, actual_count)

        return (", ".join(selected),)