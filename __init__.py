from .PromtTemplate import PromptTemplateJson, PromptTemplateKeyValue, PromptTemplateGetManyRandomTemplates

WEB_DIRECTORY = "./web"

NODE_CLASS_MAPPINGS = {
    "PromptTemplateJson": PromptTemplateJson,
    "PromptTemplateJsonConstructor": PromptTemplateJson,
    "PromptTemplateKeyValue": PromptTemplateKeyValue,
    "PromptTemplateGetManyRandomTemplates":PromptTemplateGetManyRandomTemplates
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptTemplateJson": "MIM Prompt Template Json",
    "PromptTemplateKeyValue": "MIM Prompt Template Key Value",
    "PromptTemplateJsonConstructor": "MIM Prompt Template Constructor",
    "PromptTemplateGetManyRandomTemplates": "MIM Prompt Get Random Templates",
    }

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]