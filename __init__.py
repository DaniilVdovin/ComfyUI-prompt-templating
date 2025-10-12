from .PromtTemplate import PromtTemplateJson, PromtTemplateKeyValue

WEB_DIRECTORY = "./web"

NODE_CLASS_MAPPINGS = {
    "PromptTemplateJson": PromtTemplateJson,
    "PromptTemplateJsonConstructor": PromtTemplateJson,
    "PromptTemplateKeyValue": PromtTemplateKeyValue,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptTemplateJson": "MIM Prompt Template Json",
    "PromptTemplateKeyValue": "MIM Prompt Template Key Value",
    "PromptTemplateJsonConstructor": "MIM Prompt Template Constructor",
    }

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]